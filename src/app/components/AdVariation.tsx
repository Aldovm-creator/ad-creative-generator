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
const FONT = `'Inter', var(--font-inter), var(--font-geist-sans), system-ui, -apple-system, sans-serif`

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 155
}

function hexRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
}

function rgba(hex: string, a: number): string {
  const { r, g, b } = hexRgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

function darken(hex: string, amount: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, n))
  const { r, g, b } = hexRgb(hex)
  return `#${c(r - amount).toString(16).padStart(2, '0')}${c(g - amount).toString(16).padStart(2, '0')}${c(b - amount).toString(16).padStart(2, '0')}`
}

function lighten(hex: string, amt: number): string {
  return darken(hex, -amt)
}

function mixColor(hex1: string, hex2: string, ratio: number): string {
  const a = hexRgb(hex1)
  const b = hexRgb(hex2)
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
  const r = c(a.r * (1 - ratio) + b.r * ratio)
  const g = c(a.g * (1 - ratio) + b.g * ratio)
  const bl = c(a.b * (1 - ratio) + b.b * ratio)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`
}

// ═══════════════════════════════════════════════════════════════════════════════
// EBOOK / DOCUMENT MOCKUP SVG
// Spine with 3-stop gradient, stacked pages, cover with header + graphics
// ═══════════════════════════════════════════════════════════════════════════════

function EbookMockup({
  primaryColor,
  secondaryColor,
  width = 90,
  uid = 'eb',
}: {
  primaryColor: string
  secondaryColor: string
  width?: number
  uid?: string
}) {
  const h = Math.round(width * 1.38)
  const cw = width - 10           // cover width
  const ch = h - 12               // cover height
  const sp = Math.round(width * 0.12) // spine width

  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} fill="none">
      <defs>
        <linearGradient id={`${uid}-sp`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={lighten(primaryColor, 30)} />
          <stop offset="45%"  stopColor={primaryColor} />
          <stop offset="100%" stopColor={darken(primaryColor, 40)} />
        </linearGradient>
        <linearGradient id={`${uid}-hd`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor={lighten(primaryColor, 10)} />
          <stop offset="50%"  stopColor={primaryColor} />
          <stop offset="100%" stopColor={darken(primaryColor, 55)} />
        </linearGradient>
        <linearGradient id={`${uid}-sh`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.4)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </linearGradient>
      </defs>

      {/* Deep shadow layers */}
      <rect x="10" y="12" width={cw} height={ch} rx="5" fill={`url(#${uid}-sh)`} />
      <rect x="8"  y="10" width={cw} height={ch} rx="5" fill="rgba(0,0,0,0.15)" />

      {/* Stacked page edges — visible depth */}
      <rect x="6" y="7" width={cw} height={ch} rx="4" fill="#e0e0e0" />
      <line x1={cw + 5} y1="10" x2={cw + 5} y2={ch + 5} stroke="#d0d0d0" strokeWidth="0.5" />
      <rect x="4" y="5" width={cw} height={ch} rx="4" fill="#ebebeb" />
      <line x1={cw + 3} y1="8"  x2={cw + 3} y2={ch + 3} stroke="#ddd"    strokeWidth="0.5" />
      <rect x="2" y="3" width={cw} height={ch} rx="4" fill="#f4f4f4" />
      <line x1={cw + 1} y1="6"  x2={cw + 1} y2={ch + 1} stroke="#e8e8e8" strokeWidth="0.5" />

      {/* FRONT COVER */}
      <rect x="0" y="0" width={cw} height={ch} rx="5" fill="white" />
      <rect x="0" y="0" width={cw} height={ch} rx="5" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.7" />

      {/* SPINE — 3-stop gradient */}
      <rect x="0" y="0" width={sp} height={ch} rx="5" fill={`url(#${uid}-sp)`} />
      {/* Spine edge highlight */}
      <line x1={sp - 0.5} y1="6" x2={sp - 0.5} y2={ch - 6} stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
      {/* Spine shine */}
      <rect x="1" y="0" width={Math.round(sp * 0.4)} height={ch} rx="5" fill="rgba(255,255,255,0.15)" />

      {/* COVER: Header band with gradient */}
      <rect
        x={sp + 5} y={Math.round(ch * 0.07)}
        width={cw - sp - 14} height={Math.round(ch * 0.28)}
        rx="4" fill={`url(#${uid}-hd)`}
      />
      {/* Header shine overlay */}
      <rect
        x={sp + 5} y={Math.round(ch * 0.07)}
        width={cw - sp - 14} height={Math.round(ch * 0.09)}
        rx="4" fill="rgba(255,255,255,0.18)"
      />
      {/* Tiny diamonds inside header */}
      {[0.25, 0.5, 0.75].map((p, i) => (
        <rect
          key={i}
          x={sp + 5 + Math.round((cw - sp - 14) * p) - 2}
          y={Math.round(ch * 0.07) + Math.round(ch * 0.28) - 8}
          width="4" height="4"
          transform={`rotate(45 ${sp + 5 + Math.round((cw - sp - 14) * p)} ${Math.round(ch * 0.07) + Math.round(ch * 0.28) - 6})`}
          fill="rgba(255,255,255,0.3)"
        />
      ))}

      {/* COVER: Title text bars */}
      <rect x={sp + 8} y={Math.round(ch * 0.42)} width={cw - sp - 22} height={Math.round(ch * 0.048)} rx="2.5" fill="#1a1a2e" opacity="0.88" />
      <rect x={sp + 8} y={Math.round(ch * 0.49)} width={cw - sp - 30} height={Math.round(ch * 0.038)} rx="2"   fill="#1a1a2e" opacity="0.48" />
      <rect x={sp + 8} y={Math.round(ch * 0.55)} width={cw - sp - 40} height={Math.round(ch * 0.028)} rx="1.5" fill="#1a1a2e" opacity="0.25" />

      {/* COVER: Abstract graphic — layered circles + secondary accent */}
      <circle cx={Math.round(cw * 0.55)} cy={Math.round(ch * 0.73)} r={Math.round(width * 0.18)} fill={primaryColor} opacity="0.07" />
      <circle cx={Math.round(cw * 0.55)} cy={Math.round(ch * 0.73)} r={Math.round(width * 0.12)} fill={primaryColor} opacity="0.12" />
      <circle cx={Math.round(cw * 0.55)} cy={Math.round(ch * 0.73)} r={Math.round(width * 0.065)} fill={primaryColor} opacity="0.22" />
      <circle cx={Math.round(cw * 0.55)} cy={Math.round(ch * 0.73)} r={Math.round(width * 0.035)} fill={secondaryColor} opacity="0.92" />
      {/* Decorative line through graphic */}
      <line
        x1={sp + 8} y1={Math.round(ch * 0.73)}
        x2={cw - 8} y2={Math.round(ch * 0.73)}
        stroke={primaryColor} strokeWidth="0.5" opacity="0.12"
      />

      {/* COVER: Author/brand bar at bottom */}
      <rect x={sp + 8} y={ch - 20} width={Math.round(cw * 0.36)} height="3" rx="1.5" fill="#b8b8b8" />
      <rect x={sp + 8} y={ch - 14} width={Math.round(cw * 0.22)} height="2" rx="1"   fill="#d4d4d4" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT NAMES
// ═══════════════════════════════════════════════════════════════════════════════

const VARIANT_NAMES: Record<number, string> = {
  1: 'Centrado clásico',
  2: 'Dividido',
  3: 'Bold Hero',
  4: 'Marco',
  5: 'Top-Bottom',
  6: 'Diagonal',
}

// ═══════════════════════════════════════════════════════════════════════════════
// AD CANVAS — 6 agency-level layouts
// ═══════════════════════════════════════════════════════════════════════════════

interface CanvasProps { variant: number; data: AdData; size: number }

function AdCanvas({ variant, data, size }: CanvasProps) {
  const { headline, subheadline, cta, primaryColor: pc, secondaryColor: sc } = data

  const txtP   = isLight(pc) ? '#111827' : '#ffffff'
  const txtS   = isLight(sc) ? '#111827' : '#ffffff'
  const dkP    = darken(pc, 60)
  const dkP2   = darken(pc, 95)
  const ltP    = lighten(pc, 18)
  const midPS  = mixColor(pc, sc, 0.35)

  const base: React.CSSProperties = {
    width: size, height: size,
    position: 'relative', overflow: 'hidden',
    fontFamily: FONT,
  }
  const fs = (n: number) => Math.round((n / 400) * size)
  const ebW = Math.round(size * 0.24)

  // Shared CTA styles
  const ctaPrimary: React.CSSProperties = {
    background: `linear-gradient(140deg, ${ltP} 0%, ${pc} 45%, ${dkP} 100%)`,
    color: txtP,
    boxShadow: `0 2px 4px ${rgba(pc, 0.25)}, 0 8px 20px -4px ${rgba(pc, 0.45)}, 0 0 0 1px ${rgba(pc, 0.15)}`,
  }
  const ctaSecondary: React.CSSProperties = {
    background: `linear-gradient(140deg, ${lighten(sc, 12)} 0%, ${sc} 45%, ${darken(sc, 35)} 100%)`,
    color: txtS,
    boxShadow: `0 2px 4px ${rgba(sc, 0.25)}, 0 8px 20px -4px ${rgba(sc, 0.45)}, 0 0 0 1px ${rgba(sc, 0.15)}`,
  }

  switch (variant) {

    // ══════════════════════════════════════════════════════════════════════════
    // 1 · RADIANCE — radial gradient center, concentric rings, bokeh circles
    // ══════════════════════════════════════════════════════════════════════════
    case 1:
      return (
        <div style={{
          ...base,
          background: `radial-gradient(ellipse at 50% 38%, ${ltP} 0%, ${pc} 35%, ${dkP} 72%, ${dkP2} 100%)`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          padding: `${fs(24)}px ${fs(30)}px`,
          gap: fs(10),
        }}>
          {/* ── Concentric ring SVG ── */}
          <svg style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-48%)', opacity: 0.12 }}
            width={fs(340)} height={fs(340)} viewBox="0 0 340 340" fill="none">
            <circle cx="170" cy="170" r="168" stroke="white" strokeWidth="0.5" />
            <circle cx="170" cy="170" r="130" stroke="white" strokeWidth="0.5" />
            <circle cx="170" cy="170" r="92"  stroke="white" strokeWidth="0.5" />
            <circle cx="170" cy="170" r="54"  stroke="white" strokeWidth="1" />
            {/* Cross-hair lines */}
            <line x1="170" y1="0" x2="170" y2="340" stroke="white" strokeWidth="0.3" />
            <line x1="0" y1="170" x2="340" y2="170" stroke="white" strokeWidth="0.3" />
          </svg>

          {/* ── Bokeh blur circles ── */}
          <div style={{ position: 'absolute', top: fs(20), right: fs(30), width: fs(70), height: fs(70), borderRadius: '50%', background: rgba('#ffffff', 0.08), filter: 'blur(10px)' }} />
          <div style={{ position: 'absolute', bottom: fs(40), left: fs(22), width: fs(55), height: fs(55), borderRadius: '50%', background: rgba('#ffffff', 0.06), filter: 'blur(12px)' }} />
          <div style={{ position: 'absolute', top: fs(100), left: fs(16), width: fs(24), height: fs(24), borderRadius: '50%', background: rgba(sc, 0.2), filter: 'blur(6px)' }} />
          <div style={{ position: 'absolute', bottom: fs(90), right: fs(14), width: fs(18), height: fs(18), borderRadius: '50%', background: rgba(sc, 0.25), filter: 'blur(5px)' }} />

          {/* ── Small floating geometry ── */}
          <div style={{ position: 'absolute', top: fs(22), left: fs(28), width: fs(8), height: fs(8), background: rgba('#fff', 0.25), transform: 'rotate(45deg)' }} />
          <div style={{ position: 'absolute', bottom: fs(28), right: fs(42), width: fs(6), height: fs(6), borderRadius: '50%', border: `1.5px solid ${rgba('#fff', 0.3)}` }} />
          <div style={{ position: 'absolute', top: fs(60), right: fs(24), width: fs(20), height: 1, background: rgba('#fff', 0.2) }} />

          {/* ── Ebook ── */}
          <div style={{ zIndex: 1, filter: `drop-shadow(0 6px 12px rgba(0,0,0,0.35)) drop-shadow(0 16px 32px rgba(0,0,0,0.25))` }}>
            <EbookMockup primaryColor={pc} secondaryColor={sc} width={ebW} uid="v1" />
          </div>

          {/* ── Headline ── */}
          <h2 style={{
            zIndex: 1, color: txtP,
            fontSize: fs(36), fontWeight: 900, lineHeight: 1.05,
            margin: 0, letterSpacing: '-1.2px',
            textShadow: `0 0 40px ${rgba(pc, 0.5)}, 0 2px 4px rgba(0,0,0,0.3)`,
          }}>{headline}</h2>

          {/* ── Subheadline ── */}
          <p style={{ zIndex: 1, color: txtP, fontSize: fs(13), opacity: 0.8, margin: 0, lineHeight: 1.55, maxWidth: '90%' }}>{subheadline}</p>

          {/* ── Gradient divider line ── */}
          <div style={{ width: fs(60), height: 1.5, background: `linear-gradient(90deg, transparent, ${rgba('#fff', 0.35)}, transparent)`, borderRadius: 1 }} />

          {/* ── CTA ── */}
          <div style={{
            zIndex: 1, ...ctaSecondary,
            padding: `${fs(11)}px ${fs(32)}px`,
            borderRadius: 100, fontWeight: 800,
            fontSize: fs(13), letterSpacing: '0.02em',
          }}>{cta}</div>
        </div>
      )

    // ══════════════════════════════════════════════════════════════════════════
    // 2 · CONTRAST — diagonal-split, ebook bridging both panels, dot pattern
    // ══════════════════════════════════════════════════════════════════════════
    case 2:
      return (
        <div style={{ ...base, background: '#f7f8fa' }}>
          {/* ── Left panel with diagonal edge ── */}
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: '100%',
            background: `linear-gradient(165deg, ${ltP} 0%, ${pc} 38%, ${dkP} 75%, ${dkP2} 100%)`,
            clipPath: 'polygon(0 0, 56% 0, 48% 100%, 0 100%)',
          }} />

          {/* ── Decorative elements in gradient area ── */}
          <div style={{ position: 'absolute', top: -fs(30), left: -fs(20), width: fs(120), height: fs(120), borderRadius: '50%', background: rgba('#fff', 0.06), filter: 'blur(8px)' }} />
          <div style={{ position: 'absolute', bottom: fs(40), left: fs(10), width: fs(50), height: fs(50), borderRadius: '50%', border: `1.5px solid ${rgba('#fff', 0.15)}` }} />
          <div style={{ position: 'absolute', top: fs(18), left: fs(14), width: fs(10), height: fs(10), background: rgba('#fff', 0.2), transform: 'rotate(45deg)' }} />
          {/* Thin accent lines in gradient */}
          <div style={{ position: 'absolute', top: fs(70), left: 0, width: fs(50), height: 1, background: rgba('#fff', 0.12) }} />
          <div style={{ position: 'absolute', top: fs(76), left: 0, width: fs(30), height: 1, background: rgba('#fff', 0.08) }} />

          {/* ── Halftone dot pattern on right side ── */}
          <svg style={{ position: 'absolute', right: 0, top: 0, width: fs(180), height: size, opacity: 0.04 }} viewBox="0 0 180 380">
            {Array.from({ length: 15 }).map((_, row) =>
              Array.from({ length: 8 }).map((_, col) => (
                <circle key={`${row}-${col}`} cx={col * 22 + 11} cy={row * 26 + 13} r="2.5" fill={pc} />
              ))
            )}
          </svg>

          {/* ── Thin horizontal lines on right ── */}
          {[0.35, 0.52, 0.69].map((y, i) => (
            <div key={i} style={{ position: 'absolute', right: fs(18), top: `${y * 100}%`, width: fs(40 - i * 8), height: 0.5, background: rgba(pc, 0.12) }} />
          ))}

          {/* ── Content: Left headline ── */}
          <div style={{ position: 'relative', height: '100%', display: 'flex' }}>
            {/* Left content */}
            <div style={{ width: '46%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `${fs(24)}px ${fs(20)}px`, zIndex: 1 }}>
              {/* Dot cluster */}
              <div style={{ display: 'flex', gap: fs(5), marginBottom: fs(14) }}>
                {[sc, rgba('#fff', 0.6), rgba('#fff', 0.3)].map((c, i) => (
                  <div key={i} style={{ width: fs(7), height: fs(7), borderRadius: '50%', background: c }} />
                ))}
              </div>
              <h2 style={{
                color: txtP,
                fontSize: fs(36), fontWeight: 900, lineHeight: 1.02,
                margin: 0, letterSpacing: '-1.3px',
                textShadow: `0 2px 12px rgba(0,0,0,0.25)`,
              }}>{headline}</h2>
            </div>

            {/* Right content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `${fs(24)}px ${fs(18)}px ${fs(24)}px ${fs(28)}px`, gap: fs(14), zIndex: 1 }}>
              {/* Accent bar */}
              <div style={{ width: fs(36), height: fs(4), background: `linear-gradient(90deg, ${pc}, ${sc})`, borderRadius: 2 }} />
              <p style={{ color: '#334155', fontSize: fs(13), lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{subheadline}</p>
              <div style={{
                ...ctaPrimary,
                padding: `${fs(10)}px ${fs(20)}px`,
                borderRadius: fs(8), fontWeight: 800,
                fontSize: fs(12), alignSelf: 'flex-start',
                letterSpacing: '0.03em',
              }}>{cta}</div>
            </div>
          </div>

          {/* ── Ebook BRIDGING the split — positioned at the diagonal ── */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '48%',
            transform: 'translate(-50%, -50%)',
            filter: `drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 20px 40px rgba(0,0,0,0.2))`,
            zIndex: 2,
          }}>
            <EbookMockup primaryColor={pc} secondaryColor={sc} width={Math.round(ebW * 0.95)} uid="v2" />
          </div>
        </div>
      )

    // ══════════════════════════════════════════════════════════════════════════
    // 3 · TYPOGRAPHY FIRST — massive headline, minimal canvas, editorial feel
    // ══════════════════════════════════════════════════════════════════════════
    case 3:
      return (
        <div style={{ ...base, background: '#fafbfc' }}>
          {/* ── Left gradient accent bar ── */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: fs(7),
            background: `linear-gradient(180deg, ${sc} 0%, ${pc} 40%, ${dkP} 100%)`,
          }} />

          {/* ── Large soft circle behind headline area ── */}
          <div style={{
            position: 'absolute',
            left: fs(20), top: '45%', transform: 'translateY(-50%)',
            width: fs(260), height: fs(260), borderRadius: '50%',
            background: `radial-gradient(circle, ${rgba(pc, 0.07)} 0%, ${rgba(pc, 0.02)} 60%, transparent 100%)`,
          }} />

          {/* ── Subtle grid pattern ── */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025 }} viewBox="0 0 380 380">
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 20} x2="380" y2={i * 20} stroke={pc} strokeWidth="0.5" />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="380" stroke={pc} strokeWidth="0.5" />
            ))}
          </svg>

          {/* ── Corner frame accents ── */}
          {/* Top-right */}
          <div style={{ position: 'absolute', top: fs(14), right: fs(14), width: fs(28), height: 1.5, background: rgba(pc, 0.2) }} />
          <div style={{ position: 'absolute', top: fs(14), right: fs(14), width: 1.5, height: fs(28), background: rgba(pc, 0.2) }} />
          {/* Bottom-left */}
          <div style={{ position: 'absolute', bottom: fs(14), left: fs(14), width: fs(28), height: 1.5, background: rgba(pc, 0.2) }} />
          <div style={{ position: 'absolute', bottom: fs(14), left: fs(14), width: 1.5, height: fs(28), background: rgba(pc, 0.2) }} />

          {/* ── Ebook — bottom-right, rotated ── */}
          <div style={{
            position: 'absolute', right: fs(16), bottom: fs(16),
            transform: 'rotate(6deg)',
            filter: `drop-shadow(0 6px 14px rgba(0,0,0,0.18)) drop-shadow(0 14px 28px rgba(0,0,0,0.12))`,
            zIndex: 1,
          }}>
            <EbookMockup primaryColor={pc} secondaryColor={sc} width={Math.round(ebW * 0.88)} uid="v3" />
          </div>

          {/* ── Main content ── */}
          <div style={{
            position: 'relative', height: '100%',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center',
            padding: `${fs(24)}px ${fs(22)}px ${fs(24)}px ${fs(20)}px`,
          }}>
            <div style={{ maxWidth: '62%' }}>
              {/* Tag pill */}
              <div style={{
                display: 'inline-block',
                background: rgba(pc, 0.08), color: pc,
                fontSize: fs(9), fontWeight: 800,
                padding: `${fs(4)}px ${fs(11)}px`,
                borderRadius: 100, marginBottom: fs(14),
                letterSpacing: '0.1em', textTransform: 'uppercase',
                border: `1px solid ${rgba(pc, 0.12)}`,
              }}>Guía gratuita</div>

              {/* MASSIVE headline */}
              <h2 style={{
                color: '#0c0f1a',
                fontSize: fs(54), fontWeight: 900, lineHeight: 0.92,
                margin: `0 0 ${fs(14)}px`,
                letterSpacing: '-2px',
              }}>{headline}</h2>

              {/* Decorative stacked lines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: fs(12) }}>
                <div style={{ width: fs(36), height: 2.5, background: pc, borderRadius: 2 }} />
                <div style={{ width: fs(24), height: 2,   background: rgba(pc, 0.4), borderRadius: 2 }} />
                <div style={{ width: fs(14), height: 1.5, background: rgba(pc, 0.15), borderRadius: 2 }} />
              </div>

              <p style={{ color: '#64748b', fontSize: fs(12), lineHeight: 1.6, margin: `0 0 ${fs(18)}px` }}>{subheadline}</p>

              <div style={{
                ...ctaPrimary,
                padding: `${fs(10)}px ${fs(22)}px`,
                borderRadius: fs(8), fontWeight: 800,
                fontSize: fs(12), display: 'inline-flex',
                alignItems: 'center', gap: fs(6),
                letterSpacing: '0.02em',
              }}>{cta} <span style={{ opacity: 0.6, fontSize: fs(14) }}>→</span></div>
            </div>
          </div>
        </div>
      )

    // ══════════════════════════════════════════════════════════════════════════
    // 4 · OBSIDIAN — ultra-dark, neon glow, ornamental corners, premium
    // ══════════════════════════════════════════════════════════════════════════
    case 4: {
      const deepBg  = darken(pc, 100)
      const deepBg2 = darken(pc, 130)
      return (
        <div style={{
          ...base,
          background: `linear-gradient(148deg, ${deepBg} 0%, ${darken(pc, 80)} 30%, ${deepBg2} 70%, #080810 100%)`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: fs(26), gap: fs(10), textAlign: 'center',
        }}>
          {/* ── Concentric ring SVG ── */}
          <svg style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.15 }}
            width={fs(350)} height={fs(350)} viewBox="0 0 350 350" fill="none">
            {[165, 130, 100, 68, 40].map((r, i) => (
              <circle key={i} cx="175" cy="175" r={r} stroke={pc} strokeWidth={i === 3 ? 1.2 : 0.5} opacity={1 - i * 0.15} />
            ))}
            {/* Radial lines */}
            {[0, 45, 90, 135].map((angle, i) => (
              <line key={`l${i}`}
                x1={175 + Math.cos(angle * Math.PI / 180) * 40}
                y1={175 + Math.sin(angle * Math.PI / 180) * 40}
                x2={175 + Math.cos(angle * Math.PI / 180) * 165}
                y2={175 + Math.sin(angle * Math.PI / 180) * 165}
                stroke={pc} strokeWidth="0.4" opacity="0.5"
              />
            ))}
          </svg>

          {/* ── Glow blob ── */}
          <div style={{
            position: 'absolute', top: '30%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: fs(180), height: fs(100),
            background: `radial-gradient(ellipse, ${rgba(pc, 0.35)} 0%, transparent 70%)`,
            filter: 'blur(30px)',
          }} />

          {/* ── Corner ornaments (L-shapes) ── */}
          {/* Top-left */}
          <div style={{ position: 'absolute', top: fs(14), left: fs(14) }}>
            <div style={{ width: fs(22), height: 1, background: rgba(pc, 0.4) }} />
            <div style={{ width: 1, height: fs(22), background: rgba(pc, 0.4) }} />
          </div>
          {/* Top-right */}
          <div style={{ position: 'absolute', top: fs(14), right: fs(14) }}>
            <div style={{ width: fs(22), height: 1, background: rgba(pc, 0.4), marginLeft: 'auto' }} />
            <div style={{ width: 1, height: fs(22), background: rgba(pc, 0.4), marginLeft: 'auto' }} />
          </div>
          {/* Bottom-left */}
          <div style={{ position: 'absolute', bottom: fs(14), left: fs(14), display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: fs(22) }}>
            <div style={{ width: 1, height: fs(22), background: rgba(pc, 0.4) }} />
            <div style={{ width: fs(22), height: 1, background: rgba(pc, 0.4) }} />
          </div>
          {/* Bottom-right */}
          <div style={{ position: 'absolute', bottom: fs(14), right: fs(14), display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end', height: fs(22) }}>
            <div style={{ width: 1, height: fs(22), background: rgba(pc, 0.4), alignSelf: 'flex-end' }} />
            <div style={{ width: fs(22), height: 1, background: rgba(pc, 0.4) }} />
          </div>

          {/* ── Sparkle dots ── */}
          {[[fs(50), fs(80)], [fs(310), fs(100)], [fs(70), fs(310)], [fs(320), fs(290)]].map(([x, y], i) => (
            <div key={i} style={{ position: 'absolute', left: x, top: y, width: fs(3), height: fs(3), borderRadius: '50%', background: rgba(pc, 0.5 + i * 0.1) }} />
          ))}

          {/* ── Ebook with glow ── */}
          <div style={{ zIndex: 1, position: 'relative' }}>
            {/* Glow under ebook */}
            <div style={{
              position: 'absolute', bottom: -fs(10), left: '50%', transform: 'translateX(-50%)',
              width: fs(80), height: fs(20),
              background: `radial-gradient(ellipse, ${rgba(pc, 0.5)} 0%, transparent 70%)`,
              filter: 'blur(12px)',
            }} />
            <div style={{ filter: `drop-shadow(0 8px 16px rgba(0,0,0,0.5)) drop-shadow(0 24px 48px rgba(0,0,0,0.3))` }}>
              <EbookMockup primaryColor={pc} secondaryColor={sc} width={Math.round(ebW * 1.08)} uid="v4" />
            </div>
          </div>

          {/* ── Headline with neon glow ── */}
          <h2 style={{
            zIndex: 1, color: '#ffffff',
            fontSize: fs(30), fontWeight: 900, lineHeight: 1.08,
            margin: 0, letterSpacing: '-0.8px',
            textShadow: `0 0 30px ${rgba(pc, 0.6)}, 0 0 60px ${rgba(pc, 0.25)}, 0 2px 4px rgba(0,0,0,0.4)`,
          }}>{headline}</h2>

          <p style={{ zIndex: 1, color: 'rgba(255,255,255,0.55)', fontSize: fs(12), lineHeight: 1.55, margin: 0, maxWidth: '88%' }}>{subheadline}</p>

          {/* ── CTA with glow ring ── */}
          <div style={{
            zIndex: 1, ...ctaPrimary, marginTop: fs(3),
            padding: `${fs(10)}px ${fs(28)}px`,
            borderRadius: 100, fontWeight: 800,
            fontSize: fs(12), letterSpacing: '0.04em',
          }}>{cta}</div>

          {/* ── Bottom shimmer ── */}
          <div style={{ position: 'absolute', bottom: fs(14), width: fs(56), height: 1.5, background: `linear-gradient(90deg, transparent, ${rgba(pc, 0.4)}, transparent)`, borderRadius: 1 }} />
        </div>
      )
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 5 · EDITORIAL — organic wave separator, ebook overlapping zones, magazine feel
    // ══════════════════════════════════════════════════════════════════════════
    case 5:
      return (
        <div style={{ ...base, display: 'flex', flexDirection: 'column', background: '#fff' }}>
          {/* ── Top gradient section ── */}
          <div style={{
            height: '50%',
            background: `linear-gradient(145deg, ${ltP} 0%, ${pc} 30%, ${mixColor(pc, sc, 0.15)} 65%, ${dkP} 100%)`,
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'flex-end',
            padding: `${fs(14)}px ${fs(20)}px ${fs(34)}px`,
          }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: -fs(35), right: -fs(25), width: fs(140), height: fs(140), borderRadius: '50%', background: rgba('#fff', 0.06), filter: 'blur(8px)' }} />
            <div style={{ position: 'absolute', top: fs(10), right: fs(12), width: fs(44), height: fs(44), borderRadius: '50%', border: `1.5px solid ${rgba('#fff', 0.18)}` }} />
            <div style={{ position: 'absolute', top: fs(16), right: fs(18), width: fs(12), height: fs(12), borderRadius: '50%', background: rgba('#fff', 0.1) }} />
            {/* Thin lines */}
            <div style={{ position: 'absolute', top: fs(54), left: 0, width: fs(40), height: 0.5, background: rgba('#fff', 0.15) }} />
            {/* Small diamond */}
            <div style={{ position: 'absolute', top: fs(14), left: fs(16), width: fs(8), height: fs(8), background: rgba('#fff', 0.2), transform: 'rotate(45deg)' }} />

            {/* Headline */}
            <h2 style={{
              color: txtP, zIndex: 1,
              fontSize: fs(34), fontWeight: 900, lineHeight: 1.02,
              margin: 0, letterSpacing: '-1.2px',
              textShadow: `0 2px 12px rgba(0,0,0,0.25)`,
              maxWidth: '70%',
            }}>{headline}</h2>
          </div>

          {/* ── SVG wave separator ── */}
          <div style={{ position: 'relative', height: fs(22), marginTop: -fs(22), zIndex: 1 }}>
            <svg viewBox="0 0 380 22" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="none">
              <path d="M0,0 C60,22 120,4 190,14 C260,24 320,2 380,12 L380,22 L0,22 Z" fill="#ffffff" />
              {/* Shadow line */}
              <path d="M0,0 C60,22 120,4 190,14 C260,24 320,2 380,12" fill="none" stroke={rgba(pc, 0.1)} strokeWidth="0.5" />
            </svg>
          </div>

          {/* ── Bottom white section ── */}
          <div style={{
            flex: 1, background: '#ffffff', position: 'relative',
            padding: `${fs(8)}px ${fs(20)}px ${fs(18)}px`,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <p style={{ color: '#475569', fontSize: fs(12), lineHeight: 1.6, margin: 0, fontWeight: 500, maxWidth: '70%' }}>{subheadline}</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                ...ctaSecondary,
                padding: `${fs(10)}px ${fs(22)}px`,
                borderRadius: 100, fontWeight: 800, fontSize: fs(12),
                letterSpacing: '0.02em',
              }}>{cta}</div>

              {/* Decorative nested circles */}
              <div style={{ position: 'relative', width: fs(34), height: fs(34) }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1.5px solid ${rgba(pc, 0.2)}` }} />
                <div style={{ position: 'absolute', inset: fs(5), borderRadius: '50%', border: `1px solid ${rgba(pc, 0.15)}` }} />
                <div style={{ position: 'absolute', inset: fs(10), borderRadius: '50%', background: rgba(pc, 0.1) }} />
              </div>
            </div>
          </div>

          {/* ── Ebook — overlapping the wave, floating between zones ── */}
          <div style={{
            position: 'absolute',
            right: fs(18), top: '42%',
            transform: 'translateY(-50%)',
            filter: `drop-shadow(0 8px 18px rgba(0,0,0,0.25)) drop-shadow(0 18px 36px rgba(0,0,0,0.15))`,
            zIndex: 3,
          }}>
            <EbookMockup primaryColor={pc} secondaryColor={sc} width={Math.round(ebW * 0.9)} uid="v5" />
          </div>
        </div>
      )

    // ══════════════════════════════════════════════════════════════════════════
    // 6 · KINETIC — multi-layer diagonals, speed lines, energetic composition
    // ══════════════════════════════════════════════════════════════════════════
    case 6:
      return (
        <div style={{ ...base, background: '#f0f2f5' }}>
          {/* ── Layer 1: Main diagonal band — primary gradient ── */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(152deg, ${ltP} 0%, ${pc} 35%, ${dkP} 75%, ${dkP2} 100%)`,
            clipPath: 'polygon(0 0, 100% 0, 100% 46%, 0 72%)',
          }} />

          {/* ── Layer 2: Secondary accent strip — thinner, different angle ── */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(152deg, ${rgba(sc, 0.7)} 0%, ${rgba(sc, 0.4)} 100%)`,
            clipPath: 'polygon(0 0, 30% 0, 0 30%)',
          }} />

          {/* ── Layer 3: Subtle light strip between zones ── */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,255,255,0.06)',
            clipPath: 'polygon(0 68%, 100% 42%, 100% 48%, 0 74%)',
          }} />

          {/* ── Decorative circles in gradient area ── */}
          <div style={{ position: 'absolute', top: -fs(40), right: -fs(25), width: fs(170), height: fs(170), borderRadius: '50%', border: `1.5px solid ${rgba('#fff', 0.12)}` }} />
          <div style={{ position: 'absolute', top: fs(6), right: fs(6), width: fs(56), height: fs(56), borderRadius: '50%', background: rgba('#fff', 0.06) }} />
          <div style={{ position: 'absolute', top: fs(14), right: fs(14), width: fs(22), height: fs(22), borderRadius: '50%', border: `1.5px solid ${rgba('#fff', 0.2)}` }} />

          {/* ── Speed/motion lines SVG ── */}
          <svg style={{ position: 'absolute', bottom: fs(100), right: fs(10), opacity: 0.08 }}
            width={fs(60)} height={fs(40)} viewBox="0 0 60 40" fill="none">
            {[0, 10, 20, 30].map((y, i) => (
              <line key={i} x1={10 + i * 3} y1={y} x2={60} y2={y} stroke={pc} strokeWidth="1.5" strokeLinecap="round" />
            ))}
          </svg>

          {/* ── Bottom-left geometry on light area ── */}
          <div style={{ position: 'absolute', bottom: fs(14), left: fs(14), width: fs(6), height: fs(6), background: rgba(pc, 0.2), transform: 'rotate(45deg)' }} />
          <div style={{ position: 'absolute', bottom: fs(30), left: fs(18), width: fs(18), height: 0.5, background: rgba(pc, 0.15) }} />

          {/* ── Content ── */}
          <div style={{
            position: 'relative', height: '100%',
            display: 'flex', flexDirection: 'column',
            padding: fs(22), zIndex: 1,
          }}>
            {/* Headline in gradient zone */}
            <h2 style={{
              color: txtP,
              fontSize: fs(38), fontWeight: 900, lineHeight: 1.02,
              margin: 0, letterSpacing: '-1.3px',
              textShadow: `0 2px 12px rgba(0,0,0,0.25)`,
              maxWidth: '68%',
            }}>{headline}</h2>

            {/* Bottom content on light zone */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: fs(10) }}>
              {/* Gradient accent bar */}
              <div style={{ width: fs(36), height: fs(3), background: `linear-gradient(90deg, ${pc}, ${midPS}, ${sc})`, borderRadius: 2 }} />

              <p style={{ color: '#334155', fontSize: fs(12), lineHeight: 1.6, margin: 0, maxWidth: '65%', fontWeight: 500 }}>{subheadline}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: fs(10) }}>
                <div style={{
                  ...ctaSecondary,
                  padding: `${fs(10)}px ${fs(22)}px`,
                  borderRadius: fs(8), fontWeight: 800,
                  fontSize: fs(12), letterSpacing: '0.02em',
                }}>{cta}</div>
                {/* Arrow accent circle */}
                <div style={{
                  width: fs(30), height: fs(30), borderRadius: '50%',
                  background: rgba(pc, 0.08),
                  border: `1.5px solid ${rgba(pc, 0.2)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: pc, fontSize: fs(14), fontWeight: 800,
                }}>→</div>
              </div>
            </div>
          </div>

          {/* ── Ebook at diagonal intersection ── */}
          <div style={{
            position: 'absolute', right: fs(15), top: fs(10),
            filter: `drop-shadow(0 10px 20px rgba(0,0,0,0.3)) drop-shadow(0 24px 48px rgba(0,0,0,0.18))`,
            zIndex: 2,
          }}>
            <EbookMockup primaryColor={pc} secondaryColor={sc} width={Math.round(ebW * 0.98)} uid="v6" />
          </div>
        </div>
      )

    default:
      return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON LOADING CARD
// ═══════════════════════════════════════════════════════════════════════════════

function SkeletonCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 20, height: 20, borderRadius: 6, background: '#e5e7eb', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: 130, height: 14, borderRadius: 4, background: '#e5e7eb', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
      <div style={{ width: SIZE, height: SIZE, borderRadius: 12, background: 'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ height: 36, borderRadius: 8, background: '#f3f4f6' }} />
      <div style={{ borderRadius: 8, padding: '12px 14px', background: '#f9fafb', border: '1px solid #f3f4f6' }}>
        <div style={{ width: 80, height: 10, borderRadius: 4, background: '#e5e7eb', marginBottom: 8 }} />
        <div style={{ width: '100%', height: 10, borderRadius: 4, background: '#f3f4f6', marginBottom: 6 }} />
        <div style={{ width: '75%', height: 10, borderRadius: 4, background: '#f3f4f6' }} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AD VARIATION (EXPORTED)
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdVariation({ variant, data, razonamiento, skeleton }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)

  if (skeleton) return <SkeletonCard />

  const download = async () => {
    if (!canvasRef.current) return
    const canvas = await html2canvas(canvasRef.current, {
      scale: 1080 / SIZE,
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
      <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>
        {variant}. {VARIANT_NAMES[variant]}
      </span>

      <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
        <div ref={canvasRef}>
          <AdCanvas variant={variant} data={data} size={SIZE} />
        </div>
      </div>

      <button
        onClick={download}
        style={{ width: '100%', padding: '9px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
        onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Descargar PNG
      </button>

      {razonamiento && (
        <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Por qué convierte</span>
          </div>
          <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.55, margin: 0 }}>{razonamiento}</p>
        </div>
      )}
    </div>
  )
}
