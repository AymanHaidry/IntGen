"""IntGen backend: renders charts (PNG) and exports native Excel workbooks."""

from __future__ import annotations

from typing import Any, Literal

import fastapi
import fastapi.middleware.cors
from fastapi import Response
from pydantic import BaseModel, Field

from charts import render_png
from excel import build_xlsx

app = fastapi.FastAPI(title="IntGen")

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ChartType = Literal[
    "column", "bar", "line", "area", "pie", "donut", "scatter", "stacked_bar"
]


class SeriesModel(BaseModel):
    name: str | None = None
    values: list[float] = Field(default_factory=list)
    x_values: list[float] | None = None
    color: str | None = None


class ChartConfig(BaseModel):
    chart_type: ChartType = "column"
    title: str | None = None
    x_label: str | None = None
    y_label: str | None = None
    categories: list[str] = Field(default_factory=list)
    series: list[SeriesModel] = Field(default_factory=list)
    bar_colors: list[str | None] | None = None
    show_legend: bool = True
    show_grid: bool = True
    show_values: bool = False


def _to_dict(cfg: ChartConfig) -> dict[str, Any]:
    return cfg.model_dump()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/render")
async def render(cfg: ChartConfig) -> Response:
    try:
        png = render_png(_to_dict(cfg))
    except Exception as exc:  # noqa: BLE001
        raise fastapi.HTTPException(status_code=400, detail=str(exc))
    return Response(content=png, media_type="image/png")


@app.post("/export/xlsx")
async def export_xlsx(cfg: ChartConfig) -> Response:
    try:
        data = build_xlsx(_to_dict(cfg))
    except Exception as exc:  # noqa: BLE001
        raise fastapi.HTTPException(status_code=400, detail=str(exc))
    filename = (cfg.title or "intgen-chart").strip().replace(" ", "_") or "chart"
    return Response(
        content=data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}.xlsx"'},
    )
