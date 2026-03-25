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

// ── Color utilities ────────────────────────────────────────────────────────────

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

function darken(hex: string, amount: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, n))
  const r = clamp(parseInt(hex.slice(1, 3), 16) - amount)
  const g = clamp(parseInt(hex.slice(3, 5), 16) - amount)
  const b = clamp(parseInt(hex.slice(5, 7), 16) - amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function lighten(hex: string, amount: number): string {
  return darken(hex, -amount)
}

// ── Ebook / Document mockup SVG ────────────────────────────────────────────────
// uid prevents gradient ID collisions when multiple instances exist in the DOM

function EbookMockup({
  primaryColor,
  secondaryColor,
  width = 80,
  uid = 'ebook',
}: {
  primaryColor: string
  secondaryColor: string
  width?: number
  uid?: string
}) {
  const h = Math.round(width * 1.32)
  const sw = Math.round(width * 0.13) // spine width
  const sg = `${uid}-sg`              // spineGrad
  const hg = `${uid}-hg`             // headerGrad

  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={sg} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(primaryColor, 25)} />
          <stop offset="100%" stopColor={darken(primaryColor, 25)} />
        </linearGradient>
        <linearGradient id={hg} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={darken(primaryColor, 45)} />
        </linearGradient>
      </defs>

      {/* Page stack shadow */}
      <rect x="6" y="8" width={width - 7} height={h - 9} rx="5" fill="rgba(0,0,0,0.28)" />
      <rect x="4" y="5" width={width - 7} height={h - 9} rx="5" fill={darken(primaryColor, 40)} opacity="0.45" />

      {/* Main cover */}
      <rect x="0" y="0" width={width - 6} height={h - 8} rx="5" fill="white" />

      {/* Spine */}
      <rect x="0" y="0" width={sw} height={h - 8} rx="5" fill={`url(#${sg})`} />
      {/* Spine shine */}
      <rect x="0" y="0" width={sw} height={Math.round(h * 0.3)} rx="5" fill="rgba(255,255,255,0.18)" />

      {/* Header band */}
      <rect x={sw + 5} y="11" width={width - sw - 18} height={Math.round(h * 0.27)} rx="4" fill={`url(#${hg})`} />
      {/* Header shine */}
      <rect x={sw + 5} y="11" width={width - sw - 18} height="7" rx="4" fill="rgba(255,255,255,0.22)" />

      {/* Title lines */}
      <rect x={sw + 9} y={Math.round(h * 0.44)} width={width - sw - 22} height={Math.round(h * 0.055)} rx="3" fill="#1e293b" opacity="0.82" />
      <rect x={sw + 9} y={Math.round(h * 0.44) + Math.round(h * 0.085)} width={width - sw - 32} height={Math.round(h * 0.04)} rx="2" fill="#1e293b" opacity="0.45" />
      <rect x={sw + 9} y={Math.round(h * 0.44) + Math.round(h * 0.155)} width={width - sw - 40} height={Math.round(h * 0.035)} rx="2" fill="#1e293b" opacity="0.25" />

      {/* Graphic element: concentric circles with secondary accent */}
      <circle cx={Math.round(width * 0.54)} cy={Math.round(h * 0.73)} r={Math.round(width * 0.18)} fill={primaryColor} opacity="0.09" />
      <circle cx={Math.round(width * 0.54)} cy={Math.round(h * 0.73)} r={Math.round(width * 0.11)} fill={primaryColor} opacity="0.16" />
      <circle cx={Math.round(width * 0.54)} cy={Math.round(h * 0.73)} r={Math.round(width * 0.06)} fill={secondaryColor} opacity="0.9" />

      {/* Bottom author line */}
      <rect x={sw + 9} y={h - 18} width={Math.round(width * 0.4)} height="3" rx="1.5" fill="#cbd5e1" />
    </svg>
  )
}

// ── Variant names ──────────────────────────────────────────────────────────────

const VARIANT_NAMES: Record<number, string> = {
  1: 'Centrado clásico',
  2: 'Dividido',
  3: 'Bold Hero',
  4: 'Marco',
  5: 'Top-Bottom',
  6: 'Diagonal',
}

// ── AdCanvas — the 6 redesigned layouts ───────────────────────────────────────

interface CanvasProps {
  variant: number
  data: AdData
  size: number
}

function AdCanvas({ variant, data, size }: CanvasProps) {
  const { headline, subheadline, cta, primaryColor, secondaryColor } = data

  const textOnPrimary   = isLight(primaryColor)   ? '#111827' : '#ffffff'
  const textOnSecondary = isLight(secondaryColor)  ? '#111827' : '#ffffff'
  const darkPrimary     = darken(primaryColor, 55)
  const darkSecondary   = darken(secondaryColor, 30)

  const base: React.CSSProperties = {
    width: size, height: size,
    position: 'relative', overflow: 'hidden',
    fontFamily: FONT,
  }

  const fs  = (n: number) => Math.round((n / 400) * size)
  const ebW = Math.round(size * 0.22)   // ebook mockup width

  // ── Shared pieces ────────────────────────────────────────────────────────────

  const GradCTAPrimary = {
    background: `linear-gradient(135deg, ${primaryColor} 0%, ${darken(primaryColor, 28)} 100%)`,
    color: textOnPrimary,
    boxShadow: `0 4px 16px ${hexWithAlpha(primaryColor, 0.42)}, 0 1px 3px rgba(0,0,0,0.18)`,
  }

  const GradCTASecondary = {
    background: `linear-gradient(135deg, ${secondaryColor} 0%, ${darkSecondary} 100%)`,
    color: textOnSecondary,
    boxShadow: `0 4px 16px ${hexWithAlpha(secondaryColor, 0.42)}, 0 1px 3px rgba(0,0,0,0.18)`,
  }

  switch (variant) {

    // ────────────────────────────────────────────────────────────────────────────
    // 1 · GRADIENT CENTRAL — full gradient bg, centered, ebook + headline + CTA
    // ────────────────────────────────────────────────────────────────────────────
    case 1:
      return (
        <div style={{
          ...base,
          background: `linear-gradient(148deg, ${lighten(primaryColor, 10)} 0%, ${darkPrimary} 100%)`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          padding: `${fs(28)}px ${fs(32)}px`,
          gap: fs(13),
        }}>
          {/* Decorative circles */}
          <div style={{ position:'absolute', top:-fs(70), right:-fs(50), width:fs(240), height:fs(240), borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
          <div style={{ position:'absolute', bottom:-fs(55), left:-fs(35), width:fs(190), height:fs(190), borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
          <div style={{ position:'absolute', top:fs(28), left:fs(24), width:fs(56), height:fs(56), borderRadius:'50%', border:`2px solid rgba(255,255,255,0.18)` }} />
          <div style={{ position:'absolute', bottom:fs(32), right:fs(22), width:fs(30), height:fs(30), borderRadius:'50%', border:`2px solid rgba(255,255,255,0.12)` }} />
          {/* Thin accent lines */}
          <div style={{ position:'absolute', top:fs(18), left:'50%', width:fs(40), height:1, background:'rgba(255,255,255,0.2)', transform:'translateX(-50%)' }} />

          {/* Ebook */}
          <div style={{ zIndex:1, filter:'drop-shadow(0 10px 28px rgba(0,0,0,0.4))' }}>
            <EbookMockup primaryColor={primaryColor} secondaryColor={secondaryColor} width={ebW} uid="v1" />
          </div>

          {/* Headline */}
          <h2 style={{
            zIndex:1, color:textOnPrimary,
            fontSize:fs(38), fontWeight:900, lineHeight:1.08,
            margin:0, letterSpacing:'-0.5px',
            textShadow:'0 2px 10px rgba(0,0,0,0.22)',
          }}>{headline}</h2>

          {/* Subheadline */}
          <p style={{
            zIndex:1, color:textOnPrimary,
            fontSize:fs(14), opacity:0.83, margin:0,
            lineHeight:1.55, maxWidth:'88%',
          }}>{subheadline}</p>

          {/* CTA */}
          <div style={{
            zIndex:1, marginTop:fs(4),
            ...GradCTASecondary,
            padding:`${fs(11)}px ${fs(30)}px`,
            borderRadius:100, fontWeight:700,
            fontSize:fs(14), letterSpacing:'0.02em',
          }}>{cta}</div>

          {/* Bottom accent */}
          <div style={{ position:'absolute', bottom:fs(16), width:fs(44), height:2, background:'rgba(255,255,255,0.28)', borderRadius:2 }} />
        </div>
      )

    // ────────────────────────────────────────────────────────────────────────────
    // 2 · AGENCY SPLIT — left gradient + ebook, right clean with subheadline
    // ────────────────────────────────────────────────────────────────────────────
    case 2:
      return (
        <div style={{ ...base, display:'flex' }}>
          {/* Left panel */}
          <div style={{
            width:'50%',
            background:`linear-gradient(158deg, ${lighten(primaryColor, 8)} 0%, ${darkPrimary} 100%)`,
            display:'flex', flexDirection:'column',
            justifyContent:'space-between',
            padding:`${fs(22)}px ${fs(18)}px`,
            position:'relative', overflow:'hidden',
          }}>
            <div style={{ position:'absolute', bottom:-fs(40), right:-fs(28), width:fs(120), height:fs(120), borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
            <div style={{ position:'absolute', top:-fs(18), left:-fs(18), width:fs(76), height:fs(76), borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />

            {/* Top dot cluster */}
            <div style={{ display:'flex', gap:fs(5), zIndex:1 }}>
              {[secondaryColor, 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.25)'].map((c, i) => (
                <div key={i} style={{ width:fs(7), height:fs(7), borderRadius:'50%', background:c }} />
              ))}
            </div>

            {/* Headline */}
            <h2 style={{
              color:textOnPrimary,
              fontSize:fs(34), fontWeight:900, lineHeight:1.05,
              margin:`${fs(10)}px 0`, zIndex:1,
              letterSpacing:'-0.5px',
              textShadow:'0 2px 8px rgba(0,0,0,0.22)',
            }}>{headline}</h2>

            {/* Ebook */}
            <div style={{ zIndex:1, filter:'drop-shadow(0 8px 18px rgba(0,0,0,0.45))' }}>
              <EbookMockup primaryColor={primaryColor} secondaryColor={secondaryColor} width={Math.round(ebW * 0.84)} uid="v2" />
            </div>
          </div>

          {/* Right panel */}
          <div style={{
            flex:1, background:'#f8fafc',
            display:'flex', flexDirection:'column',
            justifyContent:'center',
            padding:`${fs(22)}px ${fs(16)}px`,
            gap:fs(16), position:'relative',
          }}>
            {/* Dot grid */}
            <div style={{ position:'absolute', bottom:fs(14), right:fs(14), display:'grid', gridTemplateColumns:`repeat(5,1fr)`, gap:fs(5) }}>
              {Array.from({length:25}).map((_,i)=>(<div key={i} style={{ width:fs(3), height:fs(3), borderRadius:'50%', background:primaryColor, opacity:0.18 }} />))}
            </div>

            {/* Accent bar */}
            <div style={{ width:fs(34), height:fs(4), background:`linear-gradient(90deg,${primaryColor},${secondaryColor})`, borderRadius:2 }} />

            <p style={{ color:'#334155', fontSize:fs(14), lineHeight:1.6, margin:0, fontWeight:500 }}>{subheadline}</p>

            <div style={{
              ...GradCTAPrimary,
              padding:`${fs(11)}px ${fs(18)}px`,
              borderRadius:fs(8), fontWeight:700,
              fontSize:fs(13), alignSelf:'flex-start',
              letterSpacing:'0.02em',
            }}>{cta}</div>
          </div>
        </div>
      )

    // ────────────────────────────────────────────────────────────────────────────
    // 3 · BOLD EDITORIAL — white bg, massive headline, ebook rotated top-right
    // ────────────────────────────────────────────────────────────────────────────
    case 3:
      return (
        <div style={{ ...base, background:'#ffffff' }}>
          {/* Left gradient accent bar */}
          <div style={{
            position:'absolute', left:0, top:0, bottom:0, width:fs(8),
            background:`linear-gradient(180deg,${primaryColor} 0%,${secondaryColor} 100%)`,
          }} />

          {/* Subtle diagonal stripe pattern bg */}
          <div style={{
            position:'absolute', top:0, right:0, width:'55%', height:'100%',
            background:`repeating-linear-gradient(45deg,transparent,transparent 22px,${hexWithAlpha(primaryColor,0.022)} 22px,${hexWithAlpha(primaryColor,0.022)} 23px)`,
          }} />

          {/* Ebook — top right, slightly rotated */}
          <div style={{
            position:'absolute', right:fs(18), top:fs(18),
            filter:'drop-shadow(0 10px 22px rgba(0,0,0,0.22))',
            transform:'rotate(4deg)',
            zIndex:1,
          }}>
            <EbookMockup primaryColor={primaryColor} secondaryColor={secondaryColor} width={Math.round(ebW * 0.92)} uid="v3" />
          </div>

          {/* Content anchored to bottom-left */}
          <div style={{
            position:'relative', height:'100%',
            display:'flex', flexDirection:'column',
            justifyContent:'flex-end',
            padding:`${fs(28)}px ${fs(22)}px`,
          }}>
            <div style={{ maxWidth:'64%' }}>
              {/* Label pill */}
              <div style={{
                display:'inline-block',
                background:hexWithAlpha(primaryColor,0.1),
                color:primaryColor,
                fontSize:fs(10), fontWeight:700,
                padding:`${fs(4)}px ${fs(10)}px`,
                borderRadius:100, marginBottom:fs(12),
                letterSpacing:'0.08em', textTransform:'uppercase',
              }}>Guía gratuita</div>

              {/* Mega headline */}
              <h2 style={{
                color:'#0f172a',
                fontSize:fs(48), fontWeight:900, lineHeight:0.94,
                margin:`0 0 ${fs(14)}px`,
                letterSpacing:'-1.5px',
              }}>{headline}</h2>

              <p style={{ color:'#64748b', fontSize:fs(13), lineHeight:1.6, margin:`0 0 ${fs(20)}px` }}>{subheadline}</p>

              <div style={{
                ...GradCTAPrimary,
                padding:`${fs(11)}px ${fs(22)}px`,
                borderRadius:fs(8), fontWeight:700,
                fontSize:fs(13), display:'inline-flex',
                alignItems:'center', gap:fs(6),
              }}>{cta} <span style={{opacity:0.7}}>→</span></div>
            </div>

            {/* Bottom accent dots */}
            <div style={{ position:'absolute', bottom:fs(20), right:fs(20), display:'flex', gap:fs(5) }}>
              {[secondaryColor, primaryColor, hexWithAlpha(primaryColor,0.28)].map((c,i)=>(
                <div key={i} style={{ width:fs(7), height:fs(7), borderRadius:'50%', background:c }} />
              ))}
            </div>
          </div>
        </div>
      )

    // ────────────────────────────────────────────────────────────────────────────
    // 4 · DARK PREMIUM — very dark gradient, glow effect, centered composition
    // ────────────────────────────────────────────────────────────────────────────
    case 4:
      return (
        <div style={{
          ...base,
          background:`linear-gradient(140deg,${darken(primaryColor,80)} 0%,${darken(primaryColor,115)} 100%)`,
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          padding:fs(28), gap:fs(12),
        }}>
          {/* Geometric concentric rings */}
          {[fs(270), fs(320), fs(370)].map((d,i)=>(
            <div key={i} style={{
              position:'absolute', top:'50%', left:'50%',
              transform:'translate(-50%,-50%)',
              width:d, height:d, borderRadius:'50%',
              border:`1px solid ${hexWithAlpha(primaryColor, 0.18 - i * 0.05)}`,
            }} />
          ))}

          {/* Color glow blob */}
          <div style={{
            position:'absolute', top:'28%', left:'50%',
            transform:'translate(-50%,-50%)',
            width:fs(160), height:fs(90),
            background:primaryColor,
            filter:'blur(52px)', opacity:0.28,
          }} />

          {/* Ebook */}
          <div style={{ zIndex:1, filter:'drop-shadow(0 14px 36px rgba(0,0,0,0.65))' }}>
            <EbookMockup primaryColor={primaryColor} secondaryColor={secondaryColor} width={Math.round(ebW * 1.12)} uid="v4" />
          </div>

          {/* Headline with glow */}
          <h2 style={{
            zIndex:1, color:'#ffffff',
            fontSize:fs(30), fontWeight:900, lineHeight:1.1,
            margin:0, textAlign:'center',
            letterSpacing:'-0.3px',
            textShadow:`0 0 28px ${hexWithAlpha(primaryColor,0.55)}, 0 2px 6px rgba(0,0,0,0.3)`,
          }}>{headline}</h2>

          <p style={{
            zIndex:1, color:'rgba(255,255,255,0.6)',
            fontSize:fs(13), lineHeight:1.55,
            margin:0, textAlign:'center', maxWidth:'85%',
          }}>{subheadline}</p>

          {/* CTA */}
          <div style={{
            zIndex:1,
            ...GradCTAPrimary,
            padding:`${fs(11)}px ${fs(30)}px`,
            borderRadius:100, fontWeight:700,
            fontSize:fs(13), marginTop:fs(4),
            letterSpacing:'0.03em',
            outline:`1px solid ${hexWithAlpha(primaryColor,0.35)}`,
          }}>{cta}</div>

          {/* Bottom shimmer line */}
          <div style={{ position:'absolute', bottom:fs(16), width:fs(54), height:2, background:`linear-gradient(90deg,transparent,${primaryColor},transparent)`, borderRadius:2 }} />
        </div>
      )

    // ────────────────────────────────────────────────────────────────────────────
    // 5 · TOP HERO — gradient top with ebook + headline, wave separator, white bottom
    // ────────────────────────────────────────────────────────────────────────────
    case 5:
      return (
        <div style={{ ...base, display:'flex', flexDirection:'column' }}>
          {/* Top section */}
          <div style={{
            height:'52%',
            background:`linear-gradient(140deg,${lighten(primaryColor,8)} 0%,${darkPrimary} 100%)`,
            position:'relative', overflow:'hidden',
            display:'flex', alignItems:'flex-end',
            padding:`${fs(14)}px ${fs(20)}px ${fs(18)}px`,
            gap:fs(12),
          }}>
            {/* Decorative */}
            <div style={{ position:'absolute', top:-fs(28), right:-fs(18), width:fs(130), height:fs(130), borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
            <div style={{ position:'absolute', top:fs(12), right:fs(14), width:fs(48), height:fs(48), borderRadius:'50%', border:`2px solid rgba(255,255,255,0.16)` }} />
            <div style={{ position:'absolute', top:fs(20), right:fs(22), width:fs(16), height:fs(16), borderRadius:'50%', background:'rgba(255,255,255,0.1)' }} />

            {/* Ebook */}
            <div style={{ flexShrink:0, filter:'drop-shadow(0 8px 22px rgba(0,0,0,0.4))', zIndex:1 }}>
              <EbookMockup primaryColor={primaryColor} secondaryColor={secondaryColor} width={Math.round(ebW * 0.8)} uid="v5" />
            </div>

            {/* Headline */}
            <h2 style={{
              color:textOnPrimary,
              fontSize:fs(32), fontWeight:900, lineHeight:1.05,
              margin:0, letterSpacing:'-0.4px',
              textShadow:'0 2px 8px rgba(0,0,0,0.22)', zIndex:1,
            }}>{headline}</h2>
          </div>

          {/* SVG wave separator */}
          <div style={{ height:fs(14), background:`linear-gradient(140deg,${lighten(primaryColor,8)} 0%,${darkPrimary} 100%)`, position:'relative', flexShrink:0 }}>
            <svg viewBox="0 0 380 14" style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'100%' }} preserveAspectRatio="none">
              <path d="M0,0 Q95,14 190,7 Q285,0 380,10 L380,14 L0,14 Z" fill="#ffffff" />
            </svg>
          </div>

          {/* Bottom section */}
          <div style={{
            flex:1, background:'#ffffff',
            padding:`${fs(14)}px ${fs(20)}px ${fs(18)}px`,
            display:'flex', flexDirection:'column', justifyContent:'space-between',
          }}>
            <p style={{ color:'#475569', fontSize:fs(13), lineHeight:1.6, margin:0, fontWeight:500 }}>{subheadline}</p>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{
                ...GradCTASecondary,
                padding:`${fs(10)}px ${fs(20)}px`,
                borderRadius:100, fontWeight:700, fontSize:fs(13),
              }}>{cta}</div>

              {/* Decorative double ring */}
              <div style={{ position:'relative', width:fs(38), height:fs(38) }}>
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:`2px solid ${hexWithAlpha(primaryColor,0.22)}` }} />
                <div style={{ position:'absolute', inset:fs(7), borderRadius:'50%', background:hexWithAlpha(primaryColor,0.14) }} />
              </div>
            </div>
          </div>
        </div>
      )

    // ────────────────────────────────────────────────────────────────────────────
    // 6 · DIAGONAL DYNAMIC — dramatic clip-path, ebook at diagonal edge, geometric shapes
    // ────────────────────────────────────────────────────────────────────────────
    case 6:
      return (
        <div style={{ ...base, background:'#f1f5f9' }}>
          {/* Main diagonal gradient band */}
          <div style={{
            position:'absolute', top:0, left:0, right:0, bottom:0,
            background:`linear-gradient(150deg,${lighten(primaryColor,8)} 0%,${darkPrimary} 100%)`,
            clipPath:'polygon(0 0, 100% 0, 100% 44%, 0 70%)',
          }} />

          {/* Secondary color accent triangle — top-left corner */}
          <div style={{
            position:'absolute', top:0, left:0, right:0, bottom:0,
            background:`linear-gradient(150deg,${hexWithAlpha(secondaryColor,0.65)} 0%,transparent 35%)`,
            clipPath:'polygon(0 0, 28% 0, 0 32%)',
          }} />

          {/* Decorative rings in the gradient area */}
          <div style={{ position:'absolute', top:-fs(35), right:-fs(22), width:fs(165), height:fs(165), borderRadius:'50%', border:`2px solid rgba(255,255,255,0.13)` }} />
          <div style={{ position:'absolute', top:fs(8), right:fs(8), width:fs(58), height:fs(58), borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
          <div style={{ position:'absolute', top:fs(18), right:fs(18), width:fs(22), height:fs(22), borderRadius:'50%', border:`2px solid rgba(255,255,255,0.2)` }} />

          {/* Content */}
          <div style={{
            position:'relative', height:'100%',
            display:'flex', flexDirection:'column',
            padding:fs(22),
          }}>
            {/* Headline on colored area */}
            <h2 style={{
              color:textOnPrimary,
              fontSize:fs(38), fontWeight:900, lineHeight:1.05,
              margin:0, letterSpacing:'-0.5px',
              textShadow:'0 2px 10px rgba(0,0,0,0.22)',
              maxWidth:'70%',
            }}>{headline}</h2>

            {/* Ebook at the diagonal intersection */}
            <div style={{
              position:'absolute', right:fs(16), top:fs(12),
              filter:'drop-shadow(0 12px 26px rgba(0,0,0,0.38))',
              zIndex:2,
            }}>
              <EbookMockup primaryColor={primaryColor} secondaryColor={secondaryColor} width={Math.round(ebW * 0.96)} uid="v6" />
            </div>

            {/* Bottom content on light area */}
            <div style={{ marginTop:'auto', display:'flex', flexDirection:'column', gap:fs(12) }}>
              {/* Accent line */}
              <div style={{ width:fs(32), height:fs(3), background:`linear-gradient(90deg,${primaryColor},${secondaryColor})`, borderRadius:2 }} />
              <p style={{ color:'#334155', fontSize:fs(13), lineHeight:1.6, margin:0, maxWidth:'68%', fontWeight:500 }}>{subheadline}</p>

              <div style={{ display:'flex', alignItems:'center', gap:fs(10) }}>
                <div style={{
                  ...GradCTASecondary,
                  padding:`${fs(11)}px ${fs(22)}px`,
                  borderRadius:fs(8), fontWeight:700,
                  fontSize:fs(13),
                }}>{cta}</div>
                {/* Arrow circle */}
                <div style={{
                  width:fs(30), height:fs(30), borderRadius:'50%',
                  background:hexWithAlpha(primaryColor,0.12),
                  border:`1.5px solid ${hexWithAlpha(primaryColor,0.25)}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:primaryColor, fontSize:fs(14), fontWeight:700,
                }}>→</div>
              </div>
            </div>
          </div>
        </div>
      )

    default:
      return null
  }
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:20, height:20, borderRadius:6, background:'#e5e7eb', animation:'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width:130, height:14, borderRadius:4, background:'#e5e7eb', animation:'pulse 1.5s ease-in-out infinite' }} />
      </div>
      <div style={{ width:SIZE, height:SIZE, borderRadius:12, background:'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />
      <div style={{ height:36, borderRadius:8, background:'#f3f4f6' }} />
      <div style={{ borderRadius:8, padding:'12px 14px', background:'#f9fafb', border:'1px solid #f3f4f6' }}>
        <div style={{ width:80, height:10, borderRadius:4, background:'#e5e7eb', marginBottom:8 }} />
        <div style={{ width:'100%', height:10, borderRadius:4, background:'#f3f4f6', marginBottom:6 }} />
        <div style={{ width:'75%', height:10, borderRadius:4, background:'#f3f4f6' }} />
      </div>
    </div>
  )
}

// ── AdVariation (exported) ─────────────────────────────────────────────────────

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
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {/* Label */}
      <span style={{ fontSize:13, fontWeight:600, color:'#6b7280' }}>
        {variant}. {VARIANT_NAMES[variant]}
      </span>

      {/* Ad preview */}
      <div style={{ borderRadius:12, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)' }}>
        <div ref={canvasRef}>
          <AdCanvas variant={variant} data={data} size={SIZE} />
        </div>
      </div>

      {/* Download */}
      <button
        onClick={download}
        style={{ width:'100%', padding:'9px 16px', background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, fontWeight:600, color:'#374151', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:'inherit' }}
        onMouseEnter={e => (e.currentTarget.style.background='#f9fafb')}
        onMouseLeave={e => (e.currentTarget.style.background='#fff')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Descargar PNG
      </button>

      {/* Razonamiento de Claude */}
      {razonamiento && (
        <div style={{ background:'#fafafa', border:'1px solid #f0f0f0', borderRadius:10, padding:'12px 14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            <span style={{ fontSize:11, fontWeight:700, color:'#6366f1', textTransform:'uppercase', letterSpacing:'0.04em' }}>Por qué convierte</span>
          </div>
          <p style={{ fontSize:12, color:'#6b7280', lineHeight:1.55, margin:0 }}>{razonamiento}</p>
        </div>
      )}
    </div>
  )
}
