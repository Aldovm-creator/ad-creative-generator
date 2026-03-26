import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Eres un director creativo especialista en performance marketing digital. Tu único objetivo es maximizar conversiones para descargas de lead magnets. Cada decisión de copy, jerarquía visual y layout debe estar optimizada para que el usuario haga clic y descargue. Piensas como un experto en psicología del consumidor y comportamiento digital. Nunca priorizas estética sobre conversión.`

const TEXT_VARIATIONS = [
  {
    id: 1,
    nombre: 'Impacto',
    descripcion: 'Headline corto de 2-3 palabras de máximo impacto. Directo, potente, memorable. Sin verbos débiles.',
  },
  {
    id: 2,
    nombre: 'Pregunta',
    descripcion: 'Headline formulado como pregunta que ataca el pain point principal de la audiencia. Debe generar incomodidad y curiosidad.',
  },
  {
    id: 3,
    nombre: 'Número',
    descripcion: 'Headline con número específico: "5 pasos", "10 minutos", "3 errores". Los números generan credibilidad y expectativa concreta.',
  },
  {
    id: 4,
    nombre: 'Beneficio',
    descripcion: 'Headline enfocado 100% en el resultado/transformación que obtendrá el usuario. No mencionar el producto, solo el beneficio.',
  },
  {
    id: 5,
    nombre: 'Urgencia',
    descripcion: 'Headline con escasez o tiempo limitado. "Solo hoy", "Últimas plazas", "Antes de que sea tarde". Genera FOMO.',
  },
  {
    id: 6,
    nombre: 'Social Proof',
    descripcion: 'Headline que usa prueba social: "Como X empresas", "+2,500 profesionales ya lo usan", "El método que usan en [industria]".',
  },
]

interface RequestBody {
  brand: string
  audience: string
  objetivo: string
  leadMagnetType: string
  primaryColor: string
  secondaryColor: string
}

interface VariationDecision {
  id: number
  nombre: string
  headline: string
  subheadline: string
  razonamiento: string
}

interface CreativeResponse {
  variaciones: VariationDecision[]
}

export async function POST(request: NextRequest) {
  let body: Partial<RequestBody>

  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: 'JSON inválido en el cuerpo.' }, { status: 400 })
  }

  const { brand, audience, objetivo, leadMagnetType, primaryColor, secondaryColor } = body

  const missing = ['brand', 'audience', 'objetivo', 'primaryColor', 'secondaryColor'].filter(
    (k) => !body[k as keyof RequestBody]?.trim()
  )
  if (missing.length > 0) {
    return Response.json(
      { success: false, error: `Faltan campos requeridos: ${missing.join(', ')}` },
      { status: 422 }
    )
  }

  const userPrompt = `Analiza este brief de marketing y devuelve ÚNICAMENTE un objeto JSON válido (sin markdown, sin bloques de código, sin texto adicional antes o después).

BRIEF:
- Marca: ${brand}
- Audiencia objetivo: ${audience}
- Objetivo de conversión: ${objetivo}
- Tipo de lead magnet: ${leadMagnetType || 'Ebook / Guía'}
- Color principal del anuncio: ${primaryColor}
- Color secundario del anuncio: ${secondaryColor}

NOTA: NO incluyas botón de CTA en el diseño — Meta Ads pone su propio botón automáticamente.

ESTILOS DE HEADLINE A GENERAR:
${TEXT_VARIATIONS.map((v) => `${v.id}. ${v.nombre}: ${v.descripcion}`).join('\n')}

INSTRUCCIONES:
Genera 6 variaciones de texto para el MISMO anuncio visual. Cada variación tiene un headline y subheadline diferentes según el estilo indicado.

FORMATO JSON ESPERADO:
{
  "variaciones": [
    { "id": 1, "nombre": "Impacto", "headline": "2-3 palabras de impacto", "subheadline": "frase complementaria corta (max 15 palabras)", "razonamiento": "por qué este estilo de texto convierte para esta audiencia" },
    { "id": 2, "nombre": "Pregunta", "headline": "¿Pregunta del pain point?", "subheadline": "frase complementaria corta", "razonamiento": "..." },
    { "id": 3, "nombre": "Número", "headline": "X pasos/minutos/errores...", "subheadline": "frase complementaria corta", "razonamiento": "..." },
    { "id": 4, "nombre": "Beneficio", "headline": "resultado transformador", "subheadline": "frase complementaria corta", "razonamiento": "..." },
    { "id": 5, "nombre": "Urgencia", "headline": "escasez o tiempo limitado", "subheadline": "frase complementaria corta", "razonamiento": "..." },
    { "id": 6, "nombre": "Social Proof", "headline": "prueba social específica", "subheadline": "frase complementaria corta", "razonamiento": "..." }
  ]
}

IMPORTANTE: Cada variación DEBE tener su propio headline y subheadline únicos. No repitas el mismo texto.`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return Response.json({ success: false, error: 'Claude no devolvió texto.' }, { status: 500 })
    }

    // Strip markdown code fences if present, then parse JSON
    const raw = textBlock.text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '')
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json(
        { success: false, error: 'La respuesta de Claude no contenía JSON válido.' },
        { status: 500 }
      )
    }

    const parsed = JSON.parse(jsonMatch[0]) as CreativeResponse

    // Basic validation
    if (!Array.isArray(parsed.variaciones) || parsed.variaciones.length === 0) {
      return Response.json(
        { success: false, error: 'La respuesta de Claude no tiene la estructura esperada.' },
        { status: 500 }
      )
    }

    return Response.json({ success: true, data: parsed })
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return Response.json({ success: false, error: 'API key de Anthropic inválida.' }, { status: 401 })
    }
    if (err instanceof Anthropic.RateLimitError) {
      return Response.json({ success: false, error: 'Límite de requests de Anthropic alcanzado. Intenta en un momento.' }, { status: 429 })
    }
    if (err instanceof Anthropic.APIError) {
      return Response.json({ success: false, error: `Error de Anthropic API: ${err.message}` }, { status: 500 })
    }
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
