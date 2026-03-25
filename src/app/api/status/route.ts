export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'Ad Creative Generator API',
    version: '1.0.0',
    endpoints: {
      'POST /api/generate': 'Genera variaciones de ad creatives a partir de los inputs del formulario',
      'GET /api/status': 'Confirma que la API está activa',
    },
    variacionesDisponibles: [
      'Centrado clásico',
      'Dividido',
      'Bold Hero',
      'Marco',
      'Top-Bottom',
      'Diagonal',
    ],
    timestamp: new Date().toISOString(),
  })
}
