import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Call a Python service or use a WASM/JS chart renderer
  // Option A: If you have a Python microservice deployed elsewhere:
  const pythonServiceUrl = process.env.PYTHON_RENDER_URL 
    || 'https://your-python-service.vercel.app/render'

  try {
    const res = await fetch(pythonServiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      return NextResponse.json(
        { error: detail || `Render failed (${res.status})` },
        { status: res.status }
      )
    }

    const blob = await res.blob()
    return new NextResponse(blob, {
      headers: { 'Content-Type': 'image/png' },
    })
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || 'Render service unavailable' },
      { status: 503 }
    )
  }
}
