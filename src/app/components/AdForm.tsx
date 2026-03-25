'use client'

export const LEAD_MAGNET_TYPES = [
  'Ebook / Guía',
  'Webinar',
  'Checklist',
  'White Paper',
  'Template / Plantilla',
  'Diagnóstico / Reporte',
  'Video / Mini curso',
] as const

export type LeadMagnetType = typeof LEAD_MAGNET_TYPES[number]

export interface FormInput {
  brand: string
  audience: string
  objetivo: string
  leadMagnetType: LeadMagnetType
  primaryColor: string
  secondaryColor: string
}

interface Props {
  data: FormInput
  onChange: (data: FormInput) => void
  onGenerate: () => void
  loading: boolean
}

const inputStyle = {
  width: '100%',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 14,
  color: '#111827',
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box' as const,
  fontFamily: 'inherit',
}

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  display: 'block',
  marginBottom: 6,
}

export default function AdForm({ data, onChange, onGenerate, loading }: Props) {
  const update = (key: keyof FormInput, value: string) => {
    onChange({ ...data, [key]: value })
  }

  const canGenerate = data.brand.trim() && data.audience.trim() && data.objetivo.trim()

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        padding: 24,
        position: 'sticky',
        top: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Director Creativo IA</h2>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0', lineHeight: 1.4 }}>
          Claude genera el copy y analiza cada layout para maximizar conversiones
        </p>
      </div>

      <div style={{ height: 1, background: '#f3f4f6' }} />

      {/* Marca */}
      <div>
        <label style={labelStyle}>
          Marca <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          value={data.brand}
          onChange={(e) => update('brand', e.target.value)}
          style={inputStyle}
          placeholder="Ej: Klotx, Nike, Tu Startup"
        />
      </div>

      {/* Audiencia */}
      <div>
        <label style={labelStyle}>
          Audiencia objetivo <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <textarea
          value={data.audience}
          onChange={(e) => update('audience', e.target.value)}
          rows={2}
          style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
          placeholder="Ej: Emprendedores de 25-40 años que quieren escalar su negocio"
        />
      </div>

      {/* Objetivo */}
      <div>
        <label style={labelStyle}>
          Objetivo de conversión <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <textarea
          value={data.objetivo}
          onChange={(e) => update('objetivo', e.target.value)}
          rows={2}
          style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
          placeholder="Ej: Descargar guía gratuita '10 estrategias para triplicar ventas'"
        />
      </div>

      {/* Tipo de lead magnet */}
      <div>
        <label style={labelStyle}>
          Tipo de lead magnet <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <select
          value={data.leadMagnetType}
          onChange={(e) => update('leadMagnetType', e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: `right 12px center`, paddingRight: 32 }}
        >
          {LEAD_MAGNET_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ height: 1, background: '#f3f4f6' }} />

      {/* Colores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Color principal</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="color"
              value={data.primaryColor}
              onChange={(e) => update('primaryColor', e.target.value)}
              style={{ width: 42, height: 42, borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', padding: 2 }}
            />
            <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{data.primaryColor}</span>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Color secundario</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="color"
              value={data.secondaryColor}
              onChange={(e) => update('secondaryColor', e.target.value)}
              style={{ width: 42, height: 42, borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', padding: 2 }}
            />
            <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{data.secondaryColor}</span>
          </div>
        </div>
      </div>

      {/* Preview de colores */}
      <div style={{ borderRadius: 10, overflow: 'hidden', height: 8, display: 'flex' }}>
        <div style={{ flex: 1, background: data.primaryColor }} />
        <div style={{ flex: 1, background: data.secondaryColor }} />
      </div>

      {/* Botón Generar */}
      <button
        onClick={onGenerate}
        disabled={!canGenerate || loading}
        style={{
          width: '100%',
          padding: '13px 16px',
          background: canGenerate && !loading ? '#111827' : '#d1d5db',
          color: canGenerate && !loading ? '#fff' : '#9ca3af',
          border: 'none',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          cursor: canGenerate && !loading ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'background 0.15s',
        }}
      >
        {loading ? (
          <>
            <SpinnerIcon />
            Generando con Claude...
          </>
        ) : (
          <>
            <SparkleIcon />
            Generar con IA
          </>
        )}
      </button>

      {!canGenerate && (
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '-8px 0 0', textAlign: 'center' }}>
          Completa los campos marcados con *
        </p>
      )}
    </div>
  )
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
      <path d="M5 19l.75 2.25L8 22l-2.25.75L5 25l-.75-2.25L2 22l2.25-.75z" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" style={{ animation: 'spin 1s linear infinite', transformOrigin: 'center' }} />
    </svg>
  )
}
