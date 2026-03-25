import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Eres un director creativo especialista en performance marketing digital. Tu único objetivo es maximizar conversiones para descargas de lead magnets. Cada decisión de copy, jerarquía visual y layout debe estar optimizada para que el usuario haga clic y descargue. Piensas como un experto en psicología del consumidor y comportamiento digital. Nunca priorizas estética sobre conversión.`

const LAYOUTS = [
  {
    id: 1,
    nombre: 'Hero Asimétrico',
    descripcion: 'Fondo oscuro con gradiente del color primario. Composición asimétrica: texto alineado a la izquierda con headline gigante con palabras clave en color de acento, mockup de ebook flotando a la derecha rompiendo el borde. Badge de social proof. Máxima tensión visual.',
  },
  {
    id: 2,
    nombre: 'Full Dark',
    descripcion: 'Fondo casi negro derivado del color primario. Headline gigante con highlight de color sobre fondo oscuro. Mockup del ebook con efecto glow flotando. Estética premium y exclusiva. Grid sutil de fondo.',
  },
  {
    id: 3,
    nombre: 'Split Diagonal',
    descripcion: 'División diagonal: zona superior oscura con headline, zona inferior clara con subheadline y CTA. Mockup del ebook en la intersección exacta de la diagonal, bridging ambas zonas. Triángulo de color secundario como acento.',
  },
  {
    id: 4,
    nombre: 'Minimal Bold',
    descripcion: 'Fondo blanco/claro. Tipografía negra dominante enorme (52px). Acentos de color mínimos: barra lateral, líneas progresivas, primera letra gigante de fondo. Mockup pequeño rotado en esquina. Máxima legibilidad y contraste.',
  },
  {
    id: 5,
    nombre: 'Social Proof',
    descripcion: 'Fondo oscuro con gradiente. Badge prominente arriba con social proof. Mockup centrado con glow. Micro-estadísticas (descargas, rating). CTA abajo. Todo centrado verticalmente. Genera confianza y urgencia.',
  },
  {
    id: 6,
    nombre: 'Cinematic',
    descripcion: 'Fondo con gradiente de 3 colores (oscuro primario → mix → oscuro secundario). Barras cinematográficas top/bottom. Flare anamórfico horizontal. Mockup con perspectiva 3D CSS rompiendo el borde. Estética de trailer/película.',
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

IMPORTANTE SOBRE EL CTA:
Adapta el CTA al tipo de lead magnet:
- Ebook/Guía/White Paper/Checklist → "Descargar gratis", "Obtener guía", etc.
- Webinar → "Regístrate gratis", "Reserva tu lugar", etc.
- Template/Plantilla → "Usar plantilla", "Obtener template", etc.
- Diagnóstico/Reporte → "Ver mi diagnóstico", "Obtener reporte", etc.
- Video/Mini curso → "Ver ahora", "Acceder al curso", etc.

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
    { "id": 1, "nombre": "Hero Asimétrico", "razonamiento": "..." },
    { "id": 2, "nombre": "Full Dark", "razonamiento": "..." },
    { "id": 3, "nombre": "Split Diagonal", "razonamiento": "..." },
    { "id": 4, "nombre": "Minimal Bold", "razonamiento": "..." },
    { "id": 5, "nombre": "Social Proof", "razonamiento": "..." },
    { "id": 6, "nombre": "Cinematic", "razonamiento": "..." }
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
