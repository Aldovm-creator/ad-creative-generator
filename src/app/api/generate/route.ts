import { NextRequest } from 'next/server'

// Variaciones disponibles (coinciden con AdVariation.tsx)
const ALL_VARIANTS = [
  { id: 1, nombre: 'Centrado clásico' },
  { id: 2, nombre: 'Dividido' },
  { id: 3, nombre: 'Bold Hero' },
  { id: 4, nombre: 'Marco' },
  { id: 5, nombre: 'Top-Bottom' },
  { id: 6, nombre: 'Diagonal' },
]

// Normaliza un string para comparación flexible
function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

// Resuelve los nombres solicitados a variantes concretas
function resolveVariantes(requested: string[]): typeof ALL_VARIANTS {
  if (!requested || requested.length === 0) return ALL_VARIANTS

  return ALL_VARIANTS.filter((v) =>
    requested.some((r) => normalize(v.nombre).includes(normalize(r)) || normalize(r).includes(normalize(v.nombre)))
  )
}

// Valida que un string sea un color hex válido (#rgb o #rrggbb)
function isValidHex(color: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)
}

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return Response.json(
      { success: false, error: 'El cuerpo de la petición no es JSON válido.' },
      { status: 400 }
    )
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return Response.json(
      { success: false, error: 'Se esperaba un objeto JSON.' },
      { status: 400 }
    )
  }

  const {
    headline,
    subheadline,
    cta,
    primaryColor,
    secondaryColor,
    leadMagnetType,
    variaciones,
  } = body as Record<string, unknown>

  // ── Validaciones ───────────────────────────────────────────────────────────
  const errors: string[] = []

  if (!headline || typeof headline !== 'string' || headline.trim() === '') {
    errors.push('headline es requerido y debe ser un string no vacío.')
  }
  if (!subheadline || typeof subheadline !== 'string' || subheadline.trim() === '') {
    errors.push('subheadline es requerido y debe ser un string no vacío.')
  }
  if (!cta || typeof cta !== 'string' || cta.trim() === '') {
    errors.push('cta es requerido y debe ser un string no vacío.')
  }
  if (!primaryColor || typeof primaryColor !== 'string' || !isValidHex(primaryColor)) {
    errors.push('primaryColor es requerido y debe ser un color hex válido (ej: #6366f1).')
  }
  if (!secondaryColor || typeof secondaryColor !== 'string' || !isValidHex(secondaryColor)) {
    errors.push('secondaryColor es requerido y debe ser un color hex válido (ej: #f59e0b).')
  }
  if (variaciones !== undefined && !Array.isArray(variaciones)) {
    errors.push('variaciones debe ser un array de strings (o puede omitirse para obtener todas).')
  }

  if (errors.length > 0) {
    return Response.json(
      { success: false, errors },
      { status: 422 }
    )
  }

  // ── Resolver variaciones ───────────────────────────────────────────────────
  const variantesReq = (variaciones as string[] | undefined) ?? []
  const variantesResueltas = resolveVariantes(variantesReq)

  if (variantesResueltas.length === 0) {
    return Response.json(
      {
        success: false,
        error: `Ninguna de las variaciones solicitadas es válida. Opciones: ${ALL_VARIANTS.map((v) => v.nombre).join(', ')}.`,
      },
      { status: 422 }
    )
  }

  // ── Respuesta ──────────────────────────────────────────────────────────────
  const adData = {
    headline: (headline as string).trim(),
    subheadline: (subheadline as string).trim(),
    cta: (cta as string).trim(),
    primaryColor: primaryColor as string,
    secondaryColor: secondaryColor as string,
    leadMagnetType: (leadMagnetType as string) || 'Ebook / Guía',
  }

  return Response.json({
    success: true,
    data: {
      adData,
      variaciones: variantesResueltas.map((v) => ({
        id: v.id,
        nombre: v.nombre,
        // Props listas para pasarle directamente a <AdVariation variant={id} data={adData} />
        props: { variant: v.id, data: adData },
      })),
      meta: {
        totalVariaciones: variantesResueltas.length,
        variantesDisponibles: ALL_VARIANTS.map((v) => v.nombre),
      },
    },
  })
}

// OPTIONS para CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
