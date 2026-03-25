import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Eres un director creativo especialista en performance marketing digital. Tu único objetivo es maximizar conversiones para descargas de lead magnets. Cada decisión de copy, jerarquía visual y layout debe estar optimizada para que el usuario haga clic y descargue. Piensas como un experto en psicología del consumidor y comportamiento digital. Nunca priorizas estética sobre conversión.`

const LAYOUTS = [
  {
    id: 1,
    nombre: 'Centrado clásico',
    descripcion: 'Fondo de color primario, todo el copy centrado verticalmente. Elimina distracciones y fuerza la atención al mensaje único.',
  },
  {
    id: 2,
    nombre: 'Dividido',
    descripcion: 'Mitad izquierda color primario con headline, mitad derecha blanca con subtítulo y CTA. Contraste visual que crea tensión narrativa.',
  },
  {
    id: 3,
    nombre: 'Bold Hero',
    descripcion: 'Fondo blanco, headline enorme dominando 60% del espacio. Jerarquía tipográfica pura, texto como elemento visual.',
  },
  {
    id: 4,
    nombre: 'Marco',
    descripcion: 'Marco decorativo sobre fondo suave. Genera sensación de exclusividad y credibilidad institucional.',
  },
  {
    id: 5,
    nombre: 'Top-Bottom',
    descripcion: 'Bloque superior de color con headline impactante, zona inferior blanca para copy y CTA. Lectura en F natural para feed.',
  },
  {
    id: 6,
    nombre: 'Diagonal',
    descripcion: 'Bloque diagonal de color con el headline, copy sobre fondo limpio. Movimiento visual que interrumpe el scroll.',
  },
]

interface RequestBody {
  brand: string
  audience: string
  objetivo: string
  primaryColor: string
  secondaryColor: string
}

interface VariationDecision {
  id: number
  nombre: string
  razonamiento: string
}

interface CreativeResponse {
  headline: string
  subheadline: string
  cta: string
  variaciones: VariationDecision[]
}

export async function POST(request: NextRequest) {
  let body: Partial<RequestBody>

  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: 'JSON inválido en el cuerpo.' }, { status: 400 })
  }

  const { brand, audience, objetivo, primaryColor, secondaryColor } = body

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
- Color principal del anuncio: ${primaryColor}
- Color secundario del anuncio: ${secondaryColor}

LAYOUTS A EVALUAR:
${LAYOUTS.map((l) => `${l.id}. ${l.nombre}: ${l.descripcion}`).join('\n')}

INSTRUCCIONES:
1. headline: titular de 5-8 palabras máximo. Debe comunicar el beneficio principal de forma directa e irresistible para la audiencia. Sin signos de interrogación.
2. subheadline: 1-2 oraciones que refuercen el titular con prueba social, urgencia o especificidad del beneficio. Máximo 20 palabras.
3. cta: 2-4 palabras orientadas a acción e inmediatez. Ej: "Descargar ahora", "Quiero mi guía".
4. variaciones: para los 6 layouts, escribe un razonamiento de 2-3 oraciones explicando por qué ese layout específicamente convierte (o qué psicología activa) para este objetivo y audiencia. Sé técnico y concreto.

FORMATO JSON ESPERADO:
{
  "headline": "...",
  "subheadline": "...",
  "cta": "...",
  "variaciones": [
    { "id": 1, "nombre": "Centrado clásico", "razonamiento": "..." },
    { "id": 2, "nombre": "Dividido", "razonamiento": "..." },
    { "id": 3, "nombre": "Bold Hero", "razonamiento": "..." },
    { "id": 4, "nombre": "Marco", "razonamiento": "..." },
    { "id": 5, "nombre": "Top-Bottom", "razonamiento": "..." },
    { "id": 6, "nombre": "Diagonal", "razonamiento": "..." }
  ]
}`

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
    if (!parsed.headline || !parsed.subheadline || !parsed.cta || !Array.isArray(parsed.variaciones)) {
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
