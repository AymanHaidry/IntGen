"""Matplotlib chart rendering for IntGen, styled with the Anthropic palette."""

from __future__ import annotations

import io
from typing import Any

import matplotlib

matplotlib.use("Agg")  # headless rendering, no display needed

import matplotlib.font_manager as fm
import matplotlib.pyplot as plt

# Anthropic-inspired palette (clay coral primary + warm neutrals + calm accents)
DEFAULT_PALETTE = [
    "#CC785C",  # clay / coral (primary)
    "#6A8EAE",  # slate blue
    "#788C5D",  # sage
    "#D4A27F",  # tan
    "#BF4D43",  # brick red
    "#5C6B73",  # muted slate
    "#A87C5F",  # cocoa
    "#8DA9C4",  # dusty blue
]

INK = "#2B2A27"  # near-black warm ink for text/axes
MUTED = "#6B6862"  # muted label text
GRID = "#E4DED3"  # soft grid lines
PANEL_BG = "#FFFFFF"  # clean white plot bg (pastes nicely into Excel)


def _apply_theme() -> None:
    """Global matplotlib rcParams tuned for a refined, editorial look."""
    # Prefer a serif family for the Anthropic serif feel; fall back gracefully.
    available = {f.name for f in fm.fontManager.ttflist}
    serif_stack = [
        "Georgia",
        "Times New Roman",
        "DejaVu Serif",
        "serif",
    ]
    chosen = next((f for f in serif_stack if f in available), "DejaVu Serif")

    plt.rcParams.update(
        {
            "font.family": "serif",
            "font.serif": [chosen],
            "text.color": INK,
            "axes.edgecolor": GRID,
            "axes.labelcolor": MUTED,
            "axes.titlecolor": INK,
            "xtick.color": MUTED,
            "ytick.color": MUTED,
            "axes.linewidth": 1.0,
            "figure.dpi": 100,
        }
    )


def _colors_for(count: int, custom: list[str | None] | None) -> list[str]:
    """Resolve a color for each item, using overrides where provided."""
    out: list[str] = []
    for i in range(count):
        override = custom[i] if custom and i < len(custom) else None
        out.append(override if override else DEFAULT_PALETTE[i % len(DEFAULT_PALETTE)])
    return out


def _finish_axes(ax, cfg: dict[str, Any], *, grid_axis: str = "y") -> None:
    ax.set_title(
        cfg.get("title") or "",
        fontsize=17,
        fontweight="bold",
        pad=18,
        loc="left",
    )
    if cfg.get("x_label"):
        ax.set_xlabel(cfg["x_label"], fontsize=11, labelpad=10)
    if cfg.get("y_label"):
        ax.set_ylabel(cfg["y_label"], fontsize=11, labelpad=10)

    for spine in ("top", "right"):
        ax.spines[spine].set_visible(False)
    for spine in ("left", "bottom"):
        ax.spines[spine].set_color(GRID)

    if cfg.get("show_grid", True):
        ax.grid(axis=grid_axis, color=GRID, linewidth=1, zorder=0)
        ax.set_axisbelow(True)


def _maybe_legend(ax, cfg: dict[str, Any], series: list[dict]) -> None:
    named = [s for s in series if s.get("name")]
    if cfg.get("show_legend", True) and len(named) > 0 and len(series) > 1:
        ax.legend(
            frameon=False,
            fontsize=10,
            loc="best",
            labelcolor=INK,
        )


def _annotate_values(ax, xs, ys, *, vertical: bool = True) -> None:
    for x, y in zip(xs, ys):
        if vertical:
            ax.annotate(
                f"{y:g}",
                (x, y),
                textcoords="offset points",
                xytext=(0, 4),
                ha="center",
                fontsize=9,
                color=INK,
            )
        else:
            ax.annotate(
                f"{y:g}",
                (y, x),
                textcoords="offset points",
                xytext=(4, 0),
                va="center",
                fontsize=9,
                color=INK,
            )


def render_png(cfg: dict[str, Any]) -> bytes:
    """Render a chart config to PNG bytes."""
    _apply_theme()

    chart_type = cfg.get("chart_type", "column")
    categories = [str(c) for c in cfg.get("categories", [])]
    series = cfg.get("series", []) or []
    bar_colors = cfg.get("bar_colors")
    show_values = cfg.get("show_values", False)

    fig, ax = plt.subplots(figsize=(8, 5))
    fig.patch.set_facecolor(PANEL_BG)
    ax.set_facecolor(PANEL_BG)

    n = len(categories)
    x = list(range(n))

    if chart_type in ("column", "bar"):
        values = series[0]["values"] if series else []
        colors = _colors_for(n, bar_colors)
        if chart_type == "column":
            bars = ax.bar(x, values, color=colors, zorder=3, width=0.68)
            ax.set_xticks(x)
            ax.set_xticklabels(categories)
            _finish_axes(ax, cfg, grid_axis="y")
            if show_values:
                _annotate_values(ax, x, values, vertical=True)
        else:  # horizontal bar
            ax.barh(x, values, color=colors, zorder=3, height=0.68)
            ax.set_yticks(x)
            ax.set_yticklabels(categories)
            ax.invert_yaxis()
            _finish_axes(ax, cfg, grid_axis="x")
            if show_values:
                _annotate_values(ax, x, values, vertical=False)

    elif chart_type == "stacked_bar":
        colors = _colors_for(len(series), [s.get("color") for s in series])
        bottom = [0.0] * n
        for i, s in enumerate(series):
            vals = s.get("values", [])
            ax.bar(
                x,
                vals,
                bottom=bottom,
                color=colors[i],
                label=s.get("name") or f"Series {i + 1}",
                zorder=3,
                width=0.68,
            )
            bottom = [b + (v or 0) for b, v in zip(bottom, vals)]
        ax.set_xticks(x)
        ax.set_xticklabels(categories)
        _finish_axes(ax, cfg, grid_axis="y")
        _maybe_legend(ax, cfg, series)

    elif chart_type == "line":
        colors = _colors_for(len(series), [s.get("color") for s in series])
        for i, s in enumerate(series):
            ax.plot(
                x,
                s.get("values", []),
                color=colors[i],
                marker="o",
                markersize=5,
                linewidth=2.4,
                label=s.get("name") or f"Series {i + 1}",
                zorder=3,
            )
        ax.set_xticks(x)
        ax.set_xticklabels(categories)
        _finish_axes(ax, cfg, grid_axis="y")
        _maybe_legend(ax, cfg, series)

    elif chart_type == "area":
        colors = _colors_for(len(series), [s.get("color") for s in series])
        for i, s in enumerate(series):
            vals = s.get("values", [])
            ax.plot(x, vals, color=colors[i], linewidth=2.2, zorder=3,
                    label=s.get("name") or f"Series {i + 1}")
            ax.fill_between(x, vals, color=colors[i], alpha=0.22, zorder=2)
        ax.set_xticks(x)
        ax.set_xticklabels(categories)
        _finish_axes(ax, cfg, grid_axis="y")
        _maybe_legend(ax, cfg, series)

    elif chart_type in ("pie", "donut"):
        values = series[0]["values"] if series else []
        colors = _colors_for(n, bar_colors)
        wedgeprops = {"width": 0.42, "edgecolor": PANEL_BG, "linewidth": 2} if chart_type == "donut" else {"edgecolor": PANEL_BG, "linewidth": 2}
        wedges, texts, autotexts = ax.pie(
            values,
            labels=categories,
            colors=colors,
            autopct="%1.1f%%",
            startangle=90,
            counterclock=False,
            wedgeprops=wedgeprops,
            textprops={"fontsize": 11, "color": INK},
            pctdistance=0.78 if chart_type == "donut" else 0.6,
        )
        for at in autotexts:
            at.set_color("#FFFFFF")
            at.set_fontsize(9)
        ax.set_title(cfg.get("title") or "", fontsize=17, fontweight="bold", pad=18)
        ax.axis("equal")

    elif chart_type == "scatter":
        colors = _colors_for(len(series), [s.get("color") for s in series])
        for i, s in enumerate(series):
            vals = s.get("values", [])
            xs = s.get("x_values") or x
            ax.scatter(
                xs,
                vals,
                color=colors[i],
                s=70,
                alpha=0.85,
                edgecolors=PANEL_BG,
                linewidths=1.2,
                zorder=3,
                label=s.get("name") or f"Series {i + 1}",
            )
        if not any(s.get("x_values") for s in series):
            ax.set_xticks(x)
            ax.set_xticklabels(categories)
        _finish_axes(ax, cfg, grid_axis="both")
        _maybe_legend(ax, cfg, series)

    else:
        raise ValueError(f"Unsupported chart_type: {chart_type}")

    fig.tight_layout(pad=1.6)

    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=200, bbox_inches="tight", facecolor=PANEL_BG)
    plt.close(fig)
    buf.seek(0)
    return buf.read()
