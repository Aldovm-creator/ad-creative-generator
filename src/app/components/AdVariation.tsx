'use client'

import { useRef } from 'react'
import html2canvas from 'html2canvas'
import { AdData } from '../page'

interface Props {
  variant: number
  data: AdData
  razonamiento?: string
  skeleton?: boolean
}

const SIZE = 380

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 155
}

function hexWithAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const VARIANT_NAMES: Record<number, string> = {
  1: 'Centrado clásico',
  2: 'Dividido',
  3: 'Bold Hero',
  4: 'Marco',
  5: 'Top-Bottom',
  6: 'Diagonal',
}

interface CanvasProps {
  variant: number
  data: AdData
  size: number
}

function AdCanvas({ variant, data, size }: CanvasProps) {
  const { headline, subheadline, cta, primaryColor, secondaryColor } = data
  const textOnPrimary = isLight(primaryColor) ? '#111827' : '#ffffff'
  const textOnSecondary = isLight(secondaryColor) ? '#111827' : '#ffffff'

  const base: React.CSSProperties = {
    width: size,
    height: size,
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  }

  const fs = (n: number) => Math.round((n / 400) * size)

  switch (variant) {
    case 1:
      return (
        <div style={{ ...base, background: primaryColor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: size * 0.1, gap: size * 0.05 }}>
          <div style={{ position: 'absolute', top: -size * 0.15, right: -size * 0.15, width: size * 0.5, height: size * 0.5, borderRadius: '50%', background: hexWithAlpha('#ffffff', 0.08) }} />
          <div style={{ position: 'absolute', bottom: -size * 0.1, left: -size * 0.1, width: size * 0.35, height: size * 0.35, borderRadius: '50%', background: hexWithAlpha('#ffffff', 0.06) }} />
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.04 }}>
            <h2 style={{ color: textOnPrimary, fontSize: fs(52), fontWeight: 900, lineHeight: 1.05, margin: 0, letterSpacing: '-1px' }}>{headline}</h2>
            <p style={{ color: textOnPrimary, fontSize: fs(17), opacity: 0.85, margin: 0, lineHeight: 1.5, maxWidth: '85%' }}>{subheadline}</p>
            <div style={{ marginTop: size * 0.02, background: secondaryColor, color: textOnSecondary, padding: `${fs(12)}px ${fs(28)}px`, borderRadius: 100, fontWeight: 700, fontSize: fs(15) }}>{cta}</div>
          </div>
        </div>
      )

    case 2:
      return (
        <div style={{ ...base, display: 'flex' }}>
          <div style={{ width: '46%', background: primaryColor, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `${size * 0.08}px ${size * 0.07}px` }}>
            <div style={{ width: fs(32), height: 3, background: hexWithAlpha('#ffffff', 0.5), borderRadius: 2, marginBottom: fs(16) }} />
            <h2 style={{ color: textOnPrimary, fontSize: fs(40), fontWeight: 900, lineHeight: 1.1, margin: 0 }}>{headline}</h2>
          </div>
          <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `${size * 0.08}px ${size * 0.07}px`, gap: fs(18) }}>
            <p style={{ color: '#374151', fontSize: fs(15), lineHeight: 1.6, margin: 0 }}>{subheadline}</p>
            <div style={{ background: secondaryColor, color: textOnSecondary, padding: `${fs(10)}px ${fs(20)}px`, borderRadius: 8, fontWeight: 700, fontSize: fs(13), alignSelf: 'flex-start' }}>{cta}</div>
            <div style={{ position: 'absolute', bottom: fs(16), right: fs(16), display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: primaryColor, opacity: 0.2 }} />
              ))}
            </div>
          </div>
        </div>
      )

    case 3:
      return (
        <div style={{ ...base, background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: size * 0.11 }}>
          <div style={{ width: fs(48), height: 5, background: primaryColor, borderRadius: 3, marginBottom: fs(20) }} />
          <h2 style={{ color: '#0f172a', fontSize: fs(54), fontWeight: 900, lineHeight: 0.95, margin: `0 0 ${fs(18)}px`, letterSpacing: '-2px' }}>{headline}</h2>
          <p style={{ color: '#64748b', fontSize: fs(15), lineHeight: 1.6, margin: `0 0 ${fs(28)}px` }}>{subheadline}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: fs(12) }}>
            <div style={{ background: primaryColor, color: textOnPrimary, padding: `${fs(12)}px ${fs(24)}px`, borderRadius: 8, fontWeight: 700, fontSize: fs(14) }}>{cta}</div>
            <span style={{ color: primaryColor, fontSize: fs(13), fontWeight: 600 }}>→</span>
          </div>
          <div style={{ position: 'absolute', bottom: -size * 0.12, right: -size * 0.05, width: size * 0.4, height: size * 0.4, borderRadius: '50%', background: hexWithAlpha(secondaryColor, 0.15) }} />
        </div>
      )

    case 4:
      return (
        <div style={{ ...base, background: hexWithAlpha(primaryColor, 0.06), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: size * 0.06 }}>
          <div style={{ border: `3px solid ${primaryColor}`, borderRadius: 16, padding: `${size * 0.07}px ${size * 0.08}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: fs(16), width: '100%', background: '#fff' }}>
            <div style={{ width: fs(36), height: fs(36), borderRadius: '50%', background: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: fs(14), height: fs(14), borderRadius: '50%', background: secondaryColor }} />
            </div>
            <h2 style={{ color: '#111827', fontSize: fs(40), fontWeight: 900, lineHeight: 1.1, margin: 0 }}>{headline}</h2>
            <p style={{ color: '#6b7280', fontSize: fs(14), lineHeight: 1.55, margin: 0 }}>{subheadline}</p>
            <div style={{ background: primaryColor, color: textOnPrimary, padding: `${fs(11)}px ${fs(26)}px`, borderRadius: 100, fontWeight: 700, fontSize: fs(13) }}>{cta}</div>
          </div>
        </div>
      )

    case 5:
      return (
        <div style={{ ...base, display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: '44%', background: primaryColor, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: `${size * 0.05}px ${size * 0.09}px ${size * 0.06}px` }}>
            <h2 style={{ color: textOnPrimary, fontSize: fs(44), fontWeight: 900, lineHeight: 1.05, margin: 0 }}>{headline}</h2>
          </div>
          <div style={{ flex: 1, background: '#fff', padding: `${size * 0.06}px ${size * 0.09}px`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <p style={{ color: '#374151', fontSize: fs(15), lineHeight: 1.6, margin: 0 }}>{subheadline}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ background: secondaryColor, color: textOnSecondary, padding: `${fs(11)}px ${fs(22)}px`, borderRadius: 100, fontWeight: 700, fontSize: fs(13) }}>{cta}</div>
              <div style={{ width: fs(36), height: fs(36), borderRadius: '50%', background: hexWithAlpha(primaryColor, 0.12) }} />
            </div>
          </div>
        </div>
      )

    case 6:
      return (
        <div style={{ ...base, background: '#fff' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: primaryColor, clipPath: 'polygon(0 0, 100% 0, 100% 38%, 0 65%)' }} />
          <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', padding: size * 0.1 }}>
            <h2 style={{ color: textOnPrimary, fontSize: fs(46), fontWeight: 900, lineHeight: 1.05, margin: 0 }}>{headline}</h2>
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: fs(14) }}>
              <p style={{ color: '#374151', fontSize: fs(15), lineHeight: 1.6, margin: 0 }}>{subheadline}</p>
              <div style={{ background: secondaryColor, color: textOnSecondary, padding: `${fs(12)}px ${fs(24)}px`, borderRadius: 8, fontWeight: 700, fontSize: fs(14), alignSelf: 'flex-start' }}>{cta}</div>
            </div>
          </div>
        </div>
      )

    default:
      return null
  }
}

// Skeleton card shown while Claude is thinking
function SkeletonCard({ variant }: { variant: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 20, height: 20, borderRadius: 6, background: '#e5e7eb', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: 120, height: 14, borderRadius: 4, background: '#e5e7eb', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
      <div style={{ width: SIZE, height: SIZE, borderRadius: 12, background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ height: 36, borderRadius: 8, background: '#f3f4f6' }} />
      <div style={{ borderRadius: 8, padding: '12px 14px', background: '#f9fafb', border: '1px solid #f3f4f6' }}>
        <div style={{ width: 80, height: 10, borderRadius: 4, background: '#e5e7eb', marginBottom: 8 }} />
        <div style={{ width: '100%', height: 10, borderRadius: 4, background: '#f3f4f6', marginBottom: 6 }} />
        <div style={{ width: '80%', height: 10, borderRadius: 4, background: '#f3f4f6' }} />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default function AdVariation({ variant, data, razonamiento, skeleton }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)

  if (skeleton) return <SkeletonCard variant={variant} />

  const download = async () => {
    if (!canvasRef.current) return
    const scale = 1080 / SIZE
    const canvas = await html2canvas(canvasRef.current, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      width: SIZE,
      height: SIZE,
    })
    const link = document.createElement('a')
    link.download = `ad-v${variant}-${VARIANT_NAMES[variant].toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Label */}
      <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>
        {variant}. {VARIANT_NAMES[variant]}
      </span>

      {/* Ad preview */}
      <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.06)' }}>
        <div ref={canvasRef}>
          <AdCanvas variant={variant} data={data} size={SIZE} />
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={download}
        style={{ width: '100%', padding: '9px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Descargar PNG
      </button>

      {/* Razonamiento de Claude */}
      {razonamiento && (
        <div
          style={{
            background: '#fafafa',
            border: '1px solid #f0f0f0',
            borderRadius: 10,
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Por qué convierte
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.55, margin: 0 }}>{razonamiento}</p>
        </div>
      )}
    </div>
  )
}
