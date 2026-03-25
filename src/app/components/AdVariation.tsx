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
const FONT = `'Inter', var(--font-inter), var(--font-geist-sans), system-ui, sans-serif`

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function hexRgb(h: string) { return { r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) } }
function rgba(h: string, a: number) { const {r,g,b}=hexRgb(h); return `rgba(${r},${g},${b},${a})` }
function isLight(h: string) { const {r,g,b}=hexRgb(h); return (r*299+g*587+b*114)/1000>155 }
function darken(h: string, n: number) { const c=(v:number)=>Math.max(0,Math.min(255,v)); const {r,g,b}=hexRgb(h); return `#${c(r-n).toString(16).padStart(2,'0')}${c(g-n).toString(16).padStart(2,'0')}${c(b-n).toString(16).padStart(2,'0')}` }
function lighten(h: string, n: number) { return darken(h,-n) }
function mix(a: string, b: string, t: number) { const x=hexRgb(a),y=hexRgb(b),c=(v:number)=>Math.max(0,Math.min(255,Math.round(v))); return `#${c(x.r*(1-t)+y.r*t).toString(16).padStart(2,'0')}${c(x.g*(1-t)+y.g*t).toString(16).padStart(2,'0')}${c(x.b*(1-t)+y.b*t).toString(16).padStart(2,'0')}` }

// ═══════════════════════════════════════════════════════════════════════════════
// EBOOK MOCKUP — portada, lomo 3D, páginas apiladas, sombra profunda
// ═══════════════════════════════════════════════════════════════════════════════

function Ebook({ pc, sc, w = 100, id = 'e', title = '', brand = '' }: { pc: string; sc: string; w?: number; id?: string; title?: string; brand?: string }) {
  const h = Math.round(w * 1.38)
  const cw = w - 12, ch = h - 14, sp = Math.round(w * 0.11)
  const tOnPc = isLight(pc) ? '#0e0e0e' : '#ffffff'
  const cx = sp + 7, cxW = cw - sp - 16
  const tFs = Math.max(5.5, Math.round(w * 0.082))
  const labFs = Math.max(4, Math.round(w * 0.046))
  const brFs = Math.max(4, Math.round(w * 0.05))
  const maxCh = Math.max(8, Math.round(cxW / (tFs * 0.52)))
  const displayTitle = title || 'Guía Profesional'
  const displayBrand = brand || 'Tu Marca'
  // Word-wrap title into up to 3 lines
  const lines: string[] = []
  let cur = ''
  for (const word of displayTitle.split(' ')) {
    if (cur && (cur + ' ' + word).length > maxCh) { lines.push(cur); cur = word }
    else { cur = cur ? cur + ' ' + word : word }
  }
  if (cur) lines.push(cur)
  const titleLines = lines.slice(0, 3)

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(pc, 35)} />
          <stop offset="40%" stopColor={pc} />
          <stop offset="100%" stopColor={darken(pc, 50)} />
        </linearGradient>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={lighten(pc, 15)} />
          <stop offset="100%" stopColor={darken(pc, 60)} />
        </linearGradient>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.45)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
        </linearGradient>
        <clipPath id={`${id}c`}><rect x="0" y="0" width={cw} height={ch} rx="5" /></clipPath>
      </defs>

      {/* Shadow */}
      <rect x="12" y="14" width={cw} height={ch} rx="5" fill={`url(#${id}w)`} />
      <rect x="9" y="11" width={cw} height={ch} rx="5" fill="rgba(0,0,0,0.12)" />

      {/* Pages stack */}
      {[6,4,2].map((d,i) => (
        <g key={i}>
          <rect x={d+1} y={d+1} width={cw} height={ch} rx="4" fill={['#ddd','#e8e8e8','#f2f2f2'][i]} />
          <line x1={cw+d} y1={d+6} x2={cw+d} y2={ch+d-4} stroke={`rgba(0,0,0,${0.08-i*0.02})`} strokeWidth="0.5" />
        </g>
      ))}

      {/* Cover */}
      <rect x="0" y="0" width={cw} height={ch} rx="5" fill="white" />
      <rect x="0" y="0" width={cw} height={ch} rx="5" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.7" />

      {/* Spine */}
      <rect x="0" y="0" width={sp} height={ch} rx="5" fill={`url(#${id}s)`} />
      <rect x="1" y="0" width={Math.max(1,Math.round(sp*0.35))} height={ch} rx="5" fill="rgba(255,255,255,0.18)" />
      <line x1={sp} y1="5" x2={sp} y2={ch-5} stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />

      {/* Cover content (clipped) */}
      <g clipPath={`url(#${id}c)`}>
        {/* Header color band */}
        <rect x={sp} y="0" width={cw-sp} height={Math.round(ch*0.36)} fill={`url(#${id}h)`} />
        <rect x={sp} y="0" width={cw-sp} height={Math.round(ch*0.09)} fill="rgba(255,255,255,0.15)" />
        {/* Decorative circle in header */}
        <circle cx={cw-Math.round(w*0.14)} cy={Math.round(ch*0.2)} r={Math.round(w*0.16)} fill="rgba(255,255,255,0.06)" />

        {/* "GUÍA GRATUITA" label */}
        <text x={cx} y={Math.round(ch*0.08)+labFs} fontFamily="Inter,system-ui,sans-serif" fontWeight="700"
          fontSize={labFs} fill={tOnPc} opacity="0.55" letterSpacing="0.12em">GUÍA GRATUITA</text>
        {/* Divider under label */}
        <line x1={cx} y1={Math.round(ch*0.08)+labFs+Math.round(labFs*0.8)}
          x2={cx+Math.round(cxW*0.32)} y2={Math.round(ch*0.08)+labFs+Math.round(labFs*0.8)}
          stroke={tOnPc} strokeWidth="0.5" opacity="0.2" />

        {/* Dynamic title text */}
        <text x={cx} y={Math.round(ch*0.19)+tFs} fontFamily="Inter,system-ui,sans-serif" fontWeight="900"
          fontSize={tFs} fill={tOnPc} letterSpacing="-0.02em">
          {titleLines.map((ln,i) => (
            <tspan key={i} x={cx} dy={i===0?0:tFs*1.18}>{ln}</tspan>
          ))}
        </text>

        {/* Accent bar under title */}
        <rect x={cx} y={Math.round(ch*0.42)} width={Math.round(cxW*0.28)} height={Math.max(1.5,Math.round(w*0.018))} rx="1" fill={sc} />

        {/* Description placeholder lines — simulated content */}
        <rect x={cx} y={Math.round(ch*0.47)} width={Math.round(cxW*0.9)} height={Math.round(w*0.018)} rx="1" fill="#888" opacity="0.3" />
        <rect x={cx} y={Math.round(ch*0.47)+Math.round(w*0.033)} width={Math.round(cxW*0.7)} height={Math.round(w*0.018)} rx="1" fill="#888" opacity="0.22" />
        <rect x={cx} y={Math.round(ch*0.47)+Math.round(w*0.066)} width={Math.round(cxW*0.8)} height={Math.round(w*0.018)} rx="1" fill="#888" opacity="0.15" />
        <rect x={cx} y={Math.round(ch*0.47)+Math.round(w*0.099)} width={Math.round(cxW*0.5)} height={Math.round(w*0.018)} rx="1" fill="#888" opacity="0.1" />

        {/* Abstract graphic */}
        <circle cx={Math.round(cw*0.52)} cy={Math.round(ch*0.68)} r={Math.round(w*0.13)} fill={pc} opacity="0.06" />
        <circle cx={Math.round(cw*0.52)} cy={Math.round(ch*0.68)} r={Math.round(w*0.07)} fill={pc} opacity="0.1" />
        <circle cx={Math.round(cw*0.52)} cy={Math.round(ch*0.68)} r={Math.round(w*0.03)} fill={sc} opacity="0.8" />
        <line x1={cx} y1={Math.round(ch*0.68)} x2={cw-8} y2={Math.round(ch*0.68)} stroke={pc} strokeWidth="0.3" opacity="0.07" />

        {/* Bottom divider */}
        <line x1={cx} y1={ch-Math.round(w*0.19)} x2={cw-8} y2={ch-Math.round(w*0.19)} stroke="#ddd" strokeWidth="0.5" />

        {/* Brand name */}
        <text x={cx} y={ch-Math.round(w*0.08)} fontFamily="Inter,system-ui,sans-serif" fontWeight="700"
          fontSize={brFs} fill="#444" opacity="0.65" letterSpacing="0.05em">
          {displayBrand.toUpperCase()}
        </text>
        {/* Brand accent dot */}
        <circle cx={cx+displayBrand.length*brFs*0.58+brFs*0.7} cy={ch-Math.round(w*0.08)-brFs*0.28} r={Math.round(brFs*0.28)} fill={pc} opacity="0.55" />
      </g>
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HIGHLIGHT — colorea la primera palabra del headline
// ═══════════════════════════════════════════════════════════════════════════════

function HL({ text, color, baseColor }: { text: string; color: string; baseColor: string }) {
  const words = text.split(' ')
  if (words.length <= 1) return <span style={{ color }}>{text}</span>
  // Highlight first 1-2 words depending on length
  const hlCount = words.length <= 3 ? 1 : 2
  return (
    <>
      <span style={{ color }}>{words.slice(0, hlCount).join(' ')}</span>
      {' '}
      <span style={{ color: baseColor }}>{words.slice(hlCount).join(' ')}</span>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BADGE / PILL
// ═══════════════════════════════════════════════════════════════════════════════

function Badge({ text, bg, color, border, fs: fontSize }: { text: string; bg: string; color: string; border?: string; fs: number }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: fontSize * 0.4,
      background: bg, color,
      fontSize, fontWeight: 700,
      padding: `${fontSize * 0.35}px ${fontSize * 0.9}px`,
      borderRadius: 100,
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
      border: border || 'none',
      lineHeight: 1.3,
    }}>
      <svg width={fontSize * 0.9} height={fontSize * 0.9} viewBox="0 0 16 16" fill={color}>
        <path d="M8 0L10.2 5.4L16 6.2L11.8 10L12.8 16L8 13.2L3.2 16L4.2 10L0 6.2L5.8 5.4L8 0Z" />
      </svg>
      {text}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT NAMES
// ═══════════════════════════════════════════════════════════════════════════════

const VNAMES: Record<number, string> = {
  1: 'Hero Asimétrico',
  2: 'Full Dark',
  3: 'Split Diagonal',
  4: 'Minimal Bold',
  5: 'Social Proof',
  6: 'Cinematic',
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6 LAYOUTS
// ═══════════════════════════════════════════════════════════════════════════════

interface CP { variant: number; data: AdData; size: number }

function AdCanvas({ variant, data, size: S }: CP) {
  const { headline, subheadline, cta, primaryColor: pc, secondaryColor: sc } = data
  const tP = isLight(pc) ? '#0f0f0f' : '#ffffff'
  const tS = isLight(sc) ? '#0f0f0f' : '#ffffff'
  const dk1 = darken(pc, 55), dk2 = darken(pc, 95), dk3 = darken(pc, 130)
  const lt1 = lighten(pc, 20)
  const base: React.CSSProperties = { width: S, height: S, position: 'relative', overflow: 'hidden', fontFamily: FONT }
  const f = (n: number) => Math.round((n / 400) * S)
  const ew = Math.round(S * 0.26)

  const ctaStyle = (grad: string, txt: string, glow: string): React.CSSProperties => ({
    background: grad,
    color: txt,
    padding: `${f(12)}px ${f(28)}px`,
    borderRadius: 100,
    fontWeight: 800,
    fontSize: f(13),
    letterSpacing: '0.03em',
    boxShadow: `0 2px 4px ${rgba(glow, 0.3)}, 0 8px 24px -4px ${rgba(glow, 0.5)}, 0 0 0 1px ${rgba(glow, 0.12)}`,
    display: 'inline-block',
  })

  switch (variant) {

    // ══════════════════════════════════════════════════════════════════════════
    // 1 · HERO ASIMÉTRICO
    // Texto izquierda con highlight, mockup derecha rompiendo el borde
    // ══════════════════════════════════════════════════════════════════════════
    case 1:
      return (
        <div style={{ ...base, background: `linear-gradient(155deg, ${dk2} 0%, ${dk1} 35%, ${darken(pc, 40)} 100%)` }}>
          {/* Noise texture */}
          <div style={{ position: 'absolute', inset: 0, background: `repeating-conic-gradient(${rgba('#fff', 0.012)} 0% 25%, transparent 0% 50%)`, backgroundSize: '4px 4px' }} />
          {/* Accent line top */}
          <div style={{ position: 'absolute', top: 0, left: f(28), width: f(50), height: 3, background: `linear-gradient(90deg, ${sc}, transparent)` }} />
          {/* Blurred accent blob */}
          <div style={{ position: 'absolute', top: '20%', right: '15%', width: f(120), height: f(80), background: rgba(pc, 0.15), filter: 'blur(40px)', borderRadius: '50%' }} />

          {/* Left content */}
          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `${f(30)}px ${f(24)}px`, maxWidth: '58%', gap: f(16) }}>
            <Badge text="100% gratuito" bg={rgba(sc, 0.15)} color={sc} border={`1px solid ${rgba(sc, 0.25)}`} fs={f(9)} />
            <div>
              <h2 style={{
                fontSize: f(40), fontWeight: 900, lineHeight: 1.08,
                margin: `0 0 ${f(10)}px`, letterSpacing: '-1.2px',
                textShadow: `0 2px 20px rgba(0,0,0,0.4)`,
              }}>
                <HL text={headline} color={sc} baseColor="#ffffff" />
              </h2>
              <div style={{ width: f(44), height: 3, background: `linear-gradient(90deg, ${pc}, ${sc})`, borderRadius: 2 }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: f(12), lineHeight: 1.65, margin: 0 }}>{subheadline}</p>
            <div style={ctaStyle(`linear-gradient(135deg, ${sc}, ${darken(sc, 35)})`, tS, sc)}>{cta}</div>
          </div>

          {/* Mockup — BREAKING right edge */}
          <div style={{
            position: 'absolute',
            right: -f(22), top: '50%', transform: 'translateY(-50%) rotate(-4deg)',
            filter: `drop-shadow(-8px 12px 24px rgba(0,0,0,0.5)) drop-shadow(-4px 24px 48px rgba(0,0,0,0.25))`,
            zIndex: 2,
          }}>
            <Ebook pc={pc} sc={sc} w={Math.round(ew * 1.3)} id="v1" title={headline} />
          </div>

          {/* Corner accents */}
          <div style={{ position: 'absolute', bottom: f(14), left: f(24), display: 'flex', gap: f(5) }}>
            {[rgba('#fff', 0.4), rgba('#fff', 0.2), rgba('#fff', 0.1)].map((c, i) => (
              <div key={i} style={{ width: f(5), height: f(5), borderRadius: '50%', background: c }} />
            ))}
          </div>
        </div>
      )

    // ══════════════════════════════════════════════════════════════════════════
    // 2 · FULL DARK
    // Fondo casi negro, headline gigante con highlight, mockup con glow
    // ══════════════════════════════════════════════════════════════════════════
    case 2:
      return (
        <div style={{ ...base, background: `linear-gradient(160deg, #0a0a0f 0%, ${dk3} 40%, ${dk2} 70%, #08080d 100%)` }}>
          {/* Subtle grid */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03 }}>
            {Array.from({ length: 20 }).map((_, i) => (<line key={i} x1="0" y1={i * 20} x2={S} y2={i * 20} stroke={pc} strokeWidth="0.5" />))}
            {Array.from({ length: 20 }).map((_, i) => (<line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2={S} stroke={pc} strokeWidth="0.5" />))}
          </svg>
          {/* Glow blob */}
          <div style={{ position: 'absolute', top: '55%', left: '55%', transform: 'translate(-50%,-50%)', width: f(200), height: f(120), background: `radial-gradient(ellipse, ${rgba(pc, 0.2)} 0%, transparent 70%)`, filter: 'blur(30px)' }} />

          {/* Concentric rings SVG */}
          <svg style={{ position: 'absolute', top: '50%', left: '55%', transform: 'translate(-50%,-50%)', opacity: 0.08 }} width={f(300)} height={f(300)} viewBox="0 0 300 300" fill="none">
            {[140, 110, 80, 50].map((r, i) => (<circle key={i} cx="150" cy="150" r={r} stroke={pc} strokeWidth={i === 3 ? 1.5 : 0.5} />))}
          </svg>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `${f(30)}px ${f(26)}px`, gap: f(14) }}>
            <Badge text="Descarga rápida" bg={rgba(pc, 0.12)} color={pc} border={`1px solid ${rgba(pc, 0.2)}`} fs={f(9)} />
            <div style={{ maxWidth: '56%' }}>
              <h2 style={{
                fontSize: f(42), fontWeight: 900, lineHeight: 1.08,
                margin: `0 0 ${f(10)}px`, letterSpacing: '-1.5px',
              }}>
                <HL text={headline} color={pc} baseColor="#ffffff" />
              </h2>
              <div style={{ width: f(50), height: 3, background: pc, borderRadius: 2, boxShadow: `0 0 12px ${rgba(pc, 0.5)}` }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: f(12), lineHeight: 1.65, margin: 0, maxWidth: '55%' }}>{subheadline}</p>
            <div style={ctaStyle(`linear-gradient(135deg, ${lt1}, ${pc}, ${dk1})`, tP, pc)}>{cta}</div>
          </div>

          {/* Mockup with glow — breaking bottom-right */}
          <div style={{
            position: 'absolute',
            right: f(8), bottom: -f(30),
            transform: 'rotate(-6deg)',
            zIndex: 2,
          }}>
            <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: f(100), height: f(30), background: `radial-gradient(ellipse, ${rgba(pc, 0.4)} 0%, transparent 70%)`, filter: 'blur(16px)' }} />
            <div style={{ filter: `drop-shadow(0 8px 20px rgba(0,0,0,0.5)) drop-shadow(0 20px 40px ${rgba(pc, 0.2)})` }}>
              <Ebook pc={pc} sc={sc} w={Math.round(ew * 1.2)} id="v2" title={headline} />
            </div>
          </div>

          {/* Corner ornament */}
          <div style={{ position: 'absolute', top: f(14), right: f(14) }}>
            <div style={{ width: f(20), height: 1, background: rgba(pc, 0.3), marginLeft: 'auto' }} />
            <div style={{ width: 1, height: f(20), background: rgba(pc, 0.3), marginLeft: 'auto' }} />
          </div>
        </div>
      )

    // ══════════════════════════════════════════════════════════════════════════
    // 3 · SPLIT DIAGONAL
    // División diagonal, mockup en la intersección
    // ══════════════════════════════════════════════════════════════════════════
    case 3:
      return (
        <div style={{ ...base, background: '#f4f5f7' }}>
          {/* Diagonal dark section */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(155deg, ${dk2} 0%, ${dk1} 50%, ${darken(pc, 35)} 100%)`,
            clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 78%)',
          }} />
          {/* Secondary accent triangle */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(155deg, ${rgba(sc, 0.5)} 0%, transparent 30%)`,
            clipPath: 'polygon(0 0, 22% 0, 0 22%)',
          }} />
          {/* Noise on dark */}
          <div style={{ position: 'absolute', inset: 0, background: `repeating-conic-gradient(${rgba('#fff', 0.008)} 0% 25%, transparent 0% 50%)`, backgroundSize: '3px 3px', clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 78%)' }} />

          {/* Thin divider line at the diagonal edge */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(155deg, transparent 48%, ${rgba(pc, 0.3)} 49%, ${rgba(pc, 0.3)} 50%, transparent 51%)` }} />

          {/* Content — top dark zone */}
          <div style={{ position: 'relative', zIndex: 1, padding: `${f(20)}px ${f(22)}px`, maxWidth: '58%' }}>
            <Badge text="Edición limitada" bg={rgba(sc, 0.15)} color={sc} border={`1px solid ${rgba(sc, 0.3)}`} fs={f(8)} />
            <h2 style={{
              fontSize: f(34), fontWeight: 900, lineHeight: 1.1,
              margin: `${f(10)}px 0 ${f(8)}px`, letterSpacing: '-1.2px',
              textShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}>
              <HL text={headline} color={sc} baseColor="#fff" />
            </h2>
            <div style={{ width: f(38), height: 3, background: `linear-gradient(90deg, ${pc}, ${sc})`, borderRadius: 2 }} />
          </div>

          {/* Bottom light zone content */}
          <div style={{ position: 'absolute', bottom: f(22), left: f(22), zIndex: 1, maxWidth: '52%' }}>
            <p style={{ color: '#475569', fontSize: f(11), lineHeight: 1.6, margin: `0 0 ${f(16)}px`, fontWeight: 500 }}>{subheadline}</p>
            <div style={ctaStyle(`linear-gradient(135deg, ${pc}, ${dk1})`, tP, pc)}>{cta}</div>
          </div>

          {/* Mockup at intersection — bridging both zones */}
          <div style={{
            position: 'absolute',
            right: f(10), top: '50%', transform: 'translateY(-50%) rotate(-3deg)',
            filter: `drop-shadow(-6px 10px 20px rgba(0,0,0,0.4)) drop-shadow(-3px 20px 40px rgba(0,0,0,0.2))`,
            zIndex: 3,
          }}>
            <Ebook pc={pc} sc={sc} w={Math.round(ew * 1.1)} id="v3" title={headline} />
          </div>

          {/* Geometric — bottom right */}
          <div style={{ position: 'absolute', bottom: f(16), right: f(16), display: 'flex', gap: f(5) }}>
            {[rgba(pc, 0.3), rgba(pc, 0.15)].map((c, i) => (
              <div key={i} style={{ width: f(6), height: f(6), borderRadius: '50%', background: c }} />
            ))}
          </div>
        </div>
      )

    // ══════════════════════════════════════════════════════════════════════════
    // 4 · MINIMAL BOLD
    // Fondo blanco, tipografía negra dominante, acento de color mínimo
    // ══════════════════════════════════════════════════════════════════════════
    case 4:
      return (
        <div style={{ ...base, background: '#fafbfc' }}>
          {/* Left accent bar */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: f(6), background: `linear-gradient(180deg, ${sc} 0%, ${pc} 50%, ${dk1} 100%)` }} />

          {/* Subtle dot grid */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03 }}>
            {Array.from({ length: 16 }).map((_, r) =>
              Array.from({ length: 16 }).map((_, c) => (
                <circle key={`${r}${c}`} cx={c * 24 + 12} cy={r * 24 + 12} r="1" fill={pc} />
              ))
            )}
          </svg>

          {/* Large background letter — oversized first letter */}
          <div style={{
            position: 'absolute', right: -f(20), top: -f(30),
            fontSize: f(260), fontWeight: 900, lineHeight: 1,
            color: rgba(pc, 0.04), fontFamily: FONT,
            letterSpacing: '-10px',
          }}>{headline.charAt(0)}</div>

          {/* Corner frames */}
          <div style={{ position: 'absolute', top: f(16), right: f(16), width: f(24), height: 1.5, background: rgba(pc, 0.2) }} />
          <div style={{ position: 'absolute', top: f(16), right: f(16), width: 1.5, height: f(24), background: rgba(pc, 0.2) }} />
          <div style={{ position: 'absolute', bottom: f(16), left: f(16), width: f(24), height: 1.5, background: rgba(pc, 0.2) }} />
          <div style={{ position: 'absolute', bottom: f(16), left: f(16), width: 1.5, height: f(24), background: rgba(pc, 0.2) }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `${f(28)}px ${f(22)}px ${f(28)}px ${f(18)}px` }}>
            <div style={{ maxWidth: '60%', display: 'flex', flexDirection: 'column', gap: f(14) }}>
              {/* Pill */}
              <div style={{
                display: 'inline-block', fontSize: f(8), fontWeight: 800,
                color: pc, background: rgba(pc, 0.08),
                padding: `${f(3)}px ${f(10)}px`, borderRadius: 100,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                border: `1px solid ${rgba(pc, 0.1)}`, alignSelf: 'flex-start',
              }}>Guía gratuita</div>

              <div>
                <h2 style={{
                  fontSize: f(44), fontWeight: 900, lineHeight: 1.05,
                  margin: `0 0 ${f(10)}px`, letterSpacing: '-2px',
                  color: '#0a0a0a',
                }}>
                  {(() => {
                    const w = headline.split(' ')
                    const n = w.length <= 3 ? 1 : 2
                    return <>
                      {w.slice(0, n).join(' ')}
                      <span style={{ color: pc }}>{' '}{w.slice(n).join(' ')}</span>
                    </>
                  })()}
                </h2>
                {/* Stacked accent lines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <div style={{ width: f(40), height: 2.5, background: pc, borderRadius: 2 }} />
                  <div style={{ width: f(26), height: 2, background: rgba(pc, 0.35), borderRadius: 2 }} />
                  <div style={{ width: f(14), height: 1.5, background: rgba(pc, 0.12), borderRadius: 2 }} />
                </div>
              </div>

              <p style={{ color: '#6b7280', fontSize: f(12), lineHeight: 1.65, margin: 0 }}>{subheadline}</p>
              <div style={ctaStyle(`linear-gradient(135deg, ${pc}, ${dk1})`, tP, pc)}>{cta}</div>
            </div>
          </div>

          {/* Mockup — bottom right, rotated, breaking edge */}
          <div style={{
            position: 'absolute',
            right: -f(10), bottom: -f(18),
            transform: 'rotate(8deg)',
            filter: `drop-shadow(-4px 6px 16px rgba(0,0,0,0.15)) drop-shadow(-2px 14px 28px rgba(0,0,0,0.1))`,
            zIndex: 1,
          }}>
            <Ebook pc={pc} sc={sc} w={Math.round(ew * 1.1)} id="v4" title={headline} />
          </div>
        </div>
      )

    // ══════════════════════════════════════════════════════════════════════════
    // 5 · SOCIAL PROOF
    // Badge prominente arriba, mockup centrado, CTA abajo
    // ══════════════════════════════════════════════════════════════════════════
    case 5:
      return (
        <div style={{
          ...base,
          background: `linear-gradient(170deg, ${dk2} 0%, ${dk1} 45%, ${mix(pc, sc, 0.2)} 100%)`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center',
          padding: `${f(22)}px ${f(26)}px`,
        }}>
          {/* Noise */}
          <div style={{ position: 'absolute', inset: 0, background: `repeating-conic-gradient(${rgba('#fff', 0.01)} 0% 25%, transparent 0% 50%)`, backgroundSize: '3px 3px' }} />
          {/* Top glow */}
          <div style={{ position: 'absolute', top: -f(40), left: '50%', transform: 'translateX(-50%)', width: f(200), height: f(100), background: `radial-gradient(ellipse, ${rgba(sc, 0.15)} 0%, transparent 70%)`, filter: 'blur(30px)' }} />

          {/* Badge — prominente */}
          <div style={{ zIndex: 1, marginBottom: f(10) }}>
            <Badge text="5 min de lectura" bg={rgba(sc, 0.18)} color={sc} border={`1px solid ${rgba(sc, 0.3)}`} fs={f(10)} />
          </div>

          {/* Headline */}
          <h2 style={{
            zIndex: 1,
            fontSize: f(30), fontWeight: 900, lineHeight: 1.1,
            margin: `0 0 ${f(8)}px`, letterSpacing: '-1px',
            textShadow: '0 2px 16px rgba(0,0,0,0.3)',
            maxWidth: '88%',
          }}>
            <HL text={headline} color={sc} baseColor="#fff" />
          </h2>

          {/* Underline */}
          <div style={{ width: f(40), height: 2.5, background: `linear-gradient(90deg, transparent, ${sc}, transparent)`, borderRadius: 2, marginBottom: f(6), zIndex: 1 }} />

          <p style={{ zIndex: 1, color: 'rgba(255,255,255,0.55)', fontSize: f(11), lineHeight: 1.55, margin: `0 0 ${f(8)}px`, maxWidth: '82%' }}>{subheadline}</p>

          {/* Mockup — centered, prominent */}
          <div style={{
            zIndex: 1, position: 'relative',
            margin: `${f(6)}px 0`,
            filter: `drop-shadow(0 8px 16px rgba(0,0,0,0.4)) drop-shadow(0 20px 40px rgba(0,0,0,0.2))`,
          }}>
            <div style={{ position: 'absolute', bottom: -f(8), left: '50%', transform: 'translateX(-50%)', width: f(80), height: f(16), background: `radial-gradient(ellipse, ${rgba(pc, 0.35)} 0%, transparent 70%)`, filter: 'blur(12px)' }} />
            <Ebook pc={pc} sc={sc} w={Math.round(ew * 1.05)} id="v5" title={headline} />
          </div>

          {/* Social proof micro-stats */}
          <div style={{ zIndex: 1, display: 'flex', gap: f(16), margin: `${f(4)}px 0 ${f(6)}px` }}>
            {['+2,500 descargas', '4.9 ★ rating'].map((t, i) => (
              <span key={i} style={{ color: rgba('#fff', 0.4), fontSize: f(9), fontWeight: 600, letterSpacing: '0.03em' }}>{t}</span>
            ))}
          </div>

          {/* CTA */}
          <div style={{ zIndex: 1, ...ctaStyle(`linear-gradient(135deg, ${sc}, ${darken(sc, 35)})`, tS, sc) }}>{cta}</div>
        </div>
      )

    // ══════════════════════════════════════════════════════════════════════════
    // 6 · CINEMATIC
    // Gradiente 3 colores, mockup con perspectiva 3D CSS
    // ══════════════════════════════════════════════════════════════════════════
    case 6:
      return (
        <div style={{
          ...base,
          background: `linear-gradient(145deg, ${dk3} 0%, ${dk1} 30%, ${mix(pc, sc, 0.3)} 65%, ${darken(sc, 40)} 100%)`,
        }}>
          {/* Noise */}
          <div style={{ position: 'absolute', inset: 0, background: `repeating-conic-gradient(${rgba('#fff', 0.01)} 0% 25%, transparent 0% 50%)`, backgroundSize: '4px 4px' }} />
          {/* Cinematic bars — top and bottom */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: f(28), background: 'linear-gradient(180deg, rgba(0,0,0,0.4), transparent)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: f(28), background: 'linear-gradient(0deg, rgba(0,0,0,0.4), transparent)' }} />

          {/* Anamorphic flare */}
          <div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent 10%, ${rgba(pc, 0.15)} 40%, ${rgba(sc, 0.2)} 60%, transparent 90%)` }} />
          {/* Lens flare dot */}
          <div style={{ position: 'absolute', top: '34%', left: '45%', width: f(8), height: f(8), borderRadius: '50%', background: rgba(sc, 0.25), filter: 'blur(3px)' }} />

          {/* Content — left aligned */}
          <div style={{
            position: 'relative', zIndex: 1, height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: `${f(32)}px ${f(24)}px`,
            maxWidth: '55%', gap: f(14),
          }}>
            <Badge text="Nuevo" bg={rgba(sc, 0.15)} color={sc} border={`1px solid ${rgba(sc, 0.25)}`} fs={f(9)} />
            <div>
              <h2 style={{
                fontSize: f(38), fontWeight: 900, lineHeight: 1.08,
                margin: `0 0 ${f(10)}px`, letterSpacing: '-1.3px',
                textShadow: '0 2px 20px rgba(0,0,0,0.4)',
              }}>
                <HL text={headline} color={sc} baseColor="#fff" />
              </h2>
              <div style={{ width: f(44), height: 3, background: `linear-gradient(90deg, ${sc}, ${pc})`, borderRadius: 2, boxShadow: `0 0 10px ${rgba(sc, 0.3)}` }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: f(12), lineHeight: 1.65, margin: 0 }}>{subheadline}</p>
            <div style={ctaStyle(`linear-gradient(135deg, ${sc}, ${mix(sc, pc, 0.5)}, ${darken(sc, 30)})`, tS, sc)}>{cta}</div>
          </div>

          {/* Mockup — 3D perspective, breaking right + bottom edge */}
          <div style={{
            position: 'absolute',
            right: -f(15), bottom: -f(24),
            transform: 'perspective(600px) rotateY(-12deg) rotateX(3deg) rotate(-2deg)',
            transformOrigin: 'center bottom',
            filter: `drop-shadow(-10px 12px 20px rgba(0,0,0,0.5)) drop-shadow(-4px 24px 48px rgba(0,0,0,0.3))`,
            zIndex: 2,
          }}>
            {/* Reflected glow */}
            <div style={{ position: 'absolute', bottom: -f(12), left: '50%', transform: 'translateX(-50%)', width: f(90), height: f(20), background: `radial-gradient(ellipse, ${rgba(sc, 0.25)} 0%, transparent 70%)`, filter: 'blur(14px)' }} />
            <Ebook pc={pc} sc={sc} w={Math.round(ew * 1.35)} id="v6" title={headline} />
          </div>
        </div>
      )

    default: return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════════════════════════════

function SkeletonCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
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
// EXPORTED COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdVariation({ variant, data, razonamiento, skeleton }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  if (skeleton) return <SkeletonCard />

  const download = async () => {
    if (!canvasRef.current) return
    const canvas = await html2canvas(canvasRef.current, {
      scale: 1080 / SIZE, useCORS: true, allowTaint: true, backgroundColor: null, width: SIZE, height: SIZE,
    })
    const a = document.createElement('a')
    a.download = `ad-v${variant}-${VNAMES[variant].toLowerCase().replace(/\s+/g, '-')}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>{variant}. {VNAMES[variant]}</span>
      <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
        <div ref={canvasRef}><AdCanvas variant={variant} data={data} size={SIZE} /></div>
      </div>
      <button onClick={download}
        style={{ width: '100%', padding: '9px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
        onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Descargar PNG
      </button>
      {razonamiento && (
        <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Por qué convierte</span>
          </div>
          <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.55, margin: 0 }}>{razonamiento}</p>
        </div>
      )}
    </div>
  )
}
