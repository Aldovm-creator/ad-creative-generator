'use client'

import { AdData } from '../page'

interface Props {
  data: AdData
  onChange: (data: AdData) => void
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

export default function AdForm({ data, onChange }: Props) {
  const update = (key: keyof AdData, value: string) => {
    onChange({ ...data, [key]: value })
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #e5e7eb',
      padding: 24,
      position: 'sticky',
      top: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Configuración</h2>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>Los cambios se reflejan en tiempo real</p>
      </div>

      <div style={{ height: 1, background: '#f3f4f6' }} />

      {/* Headline */}
      <div>
        <label style={labelStyle}>Titular</label>
        <input
          type="text"
          value={data.headline}
          onChange={e => update('headline', e.target.value)}
          style={inputStyle}
          placeholder="Tu titular principal"
        />
      </div>

      {/* Subheadline */}
      <div>
        <label style={labelStyle}>Subtítulo</label>
        <textarea
          value={data.subheadline}
          onChange={e => update('subheadline', e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
          placeholder="Descripción o propuesta de valor"
        />
      </div>

      {/* CTA */}
      <div>
        <label style={labelStyle}>Llamada a la acción (CTA)</label>
        <input
          type="text"
          value={data.cta}
          onChange={e => update('cta', e.target.value)}
          style={inputStyle}
          placeholder="Ej: Comenzar ahora"
        />
      </div>

      <div style={{ height: 1, background: '#f3f4f6' }} />

      {/* Colors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Color principal</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="color"
              value={data.primaryColor}
              onChange={e => update('primaryColor', e.target.value)}
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
              onChange={e => update('secondaryColor', e.target.value)}
              style={{ width: 42, height: 42, borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', padding: 2 }}
            />
            <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{data.secondaryColor}</span>
          </div>
        </div>
      </div>

      {/* Preview de colores */}
      <div style={{ borderRadius: 10, overflow: 'hidden', height: 10, display: 'flex' }}>
        <div style={{ flex: 1, background: data.primaryColor }} />
        <div style={{ flex: 1, background: data.secondaryColor }} />
      </div>
    </div>
  )
}
