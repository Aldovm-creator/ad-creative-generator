'use client'

import { useRef } from 'react'
import html2canvas from 'html2canvas'
import { AdData } from '../page'
import type { LeadMagnetType } from './AdForm'

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

// ═══════════════════════════════════════════════════════════════════════════════
// LEAD MAGNET MOCKUP — adapta visual según tipo
// ═══════════════════════════════════════════════════════════════════════════════

function resolveType(t?: LeadMagnetType): 'book' | 'screen' | 'checklist' | 'table' | 'chart' | 'video' {
  if (!t) return 'book'
  if (t === 'Webinar') return 'screen'
  if (t === 'Checklist') return 'checklist'
  if (t === 'Template / Plantilla') return 'table'
  if (t === 'Diagnóstico / Reporte') return 'chart'
  if (t === 'Video / Mini curso') return 'video'
  return 'book'
}

function LeadMagnetMockup({ pc, sc, w = 100, id = 'e', title = '', brand = '', type: lmType }: {
  pc: string; sc: string; w?: number; id?: string; title?: string; brand?: string; type?: LeadMagnetType
}) {
  const kind = resolveType(lmType)
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
  const lines: string[] = []
  let cur = ''
  for (const word of displayTitle.split(' ')) {
    if (cur && (cur + ' ' + word).length > maxCh) { lines.push(cur); cur = word }
    else { cur = cur ? cur + ' ' + word : word }
  }
  if (cur) lines.push(cur)
  const titleLines = lines.slice(0, 3)

  const defs = (
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
  )

  const shell = (content: React.ReactNode) => (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      {defs}
      <rect x="12" y="14" width={cw} height={ch} rx="5" fill={`url(#${id}w)`} />
      <rect x="9" y="11" width={cw} height={ch} rx="5" fill="rgba(0,0,0,0.12)" />
      {[6,4,2].map((d,i) => (
        <g key={i}>
          <rect x={d+1} y={d+1} width={cw} height={ch} rx="4" fill={['#ddd','#e8e8e8','#f2f2f2'][i]} />
          <line x1={cw+d} y1={d+6} x2={cw+d} y2={ch+d-4} stroke={`rgba(0,0,0,${0.08-i*0.02})`} strokeWidth="0.5" />
        </g>
      ))}
      <rect x="0" y="0" width={cw} height={ch} rx="5" fill="white" />
      <rect x="0" y="0" width={cw} height={ch} rx="5" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.7" />
      <rect x="0" y="0" width={sp} height={ch} rx="5" fill={`url(#${id}s)`} />
      <rect x="1" y="0" width={Math.max(1,Math.round(sp*0.35))} height={ch} rx="5" fill="rgba(255,255,255,0.18)" />
      <line x1={sp} y1="5" x2={sp} y2={ch-5} stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
      <g clipPath={`url(#${id}c)`}>{content}</g>
    </svg>
  )

  if (kind === 'screen' || kind === 'video') {
    const isVid = kind === 'video'
    return shell(<>
      <rect x={sp} y="0" width={cw-sp} height={ch} fill={`url(#${id}h)`} />
      <circle cx={cw-Math.round(w*0.14)} cy={Math.round(ch*0.25)} r={Math.round(w*0.14)} fill="rgba(255,255,255,0.06)" />
      <text x={cx} y={Math.round(ch*0.12)+labFs} fontFamily="Inter,system-ui,sans-serif" fontWeight="700"
        fontSize={labFs} fill={tOnPc} opacity="0.6" letterSpacing="0.1em">{isVid ? 'MINI CURSO' : 'WEBINAR EN VIVO'}</text>
      <text x={cx} y={Math.round(ch*0.22)+tFs} fontFamily="Inter,system-ui,sans-serif" fontWeight="900"
        fontSize={tFs} fill={tOnPc} letterSpacing="-0.02em">
        {titleLines.map((ln,i) => (<tspan key={i} x={cx} dy={i===0?0:tFs*1.18}>{ln}</tspan>))}
      </text>
      <circle cx={Math.round(cw*0.5)} cy={Math.round(ch*0.62)} r={Math.round(w*0.1)} fill="rgba(255,255,255,0.2)" />
      <circle cx={Math.round(cw*0.5)} cy={Math.round(ch*0.62)} r={Math.round(w*0.07)} fill="rgba(255,255,255,0.9)" />
      {(() => { const bx=Math.round(cw*0.5)-Math.round(w*0.02), by=Math.round(ch*0.62), s=Math.round(w*0.035)
        return <polygon points={`${bx},${by-s} ${bx},${by+s} ${bx+s+Math.round(s*0.3)},${by}`} fill={pc} /> })()}
      <rect x={cx} y={Math.round(ch*0.8)} width={Math.round(cxW*0.5)} height={Math.round(w*0.018)} rx="1" fill={tOnPc} opacity="0.25" />
      <text x={cx} y={ch-Math.round(w*0.06)} fontFamily="Inter,system-ui,sans-serif" fontWeight="700"
        fontSize={brFs} fill={tOnPc} opacity="0.5" letterSpacing="0.05em">{displayBrand.toUpperCase()}</text>
    </>)
  }

  if (kind === 'checklist') {
    const checkY = (i: number) => Math.round(ch * 0.42) + i * Math.round(ch * 0.1)
    const cs = Math.round(w * 0.04)
    return shell(<>
      <rect x={sp} y="0" width={cw-sp} height={Math.round(ch*0.3)} fill={`url(#${id}h)`} />
      <rect x={sp} y="0" width={cw-sp} height={Math.round(ch*0.08)} fill="rgba(255,255,255,0.15)" />
      <text x={cx} y={Math.round(ch*0.08)+labFs} fontFamily="Inter,system-ui,sans-serif" fontWeight="700"
        fontSize={labFs} fill={tOnPc} opacity="0.6" letterSpacing="0.1em">CHECKLIST</text>
      <text x={cx} y={Math.round(ch*0.17)+tFs} fontFamily="Inter,system-ui,sans-serif" fontWeight="900"
        fontSize={tFs*0.9} fill={tOnPc} letterSpacing="-0.02em">
        {titleLines.map((ln,i) => (<tspan key={i} x={cx} dy={i===0?0:tFs*1.1}>{ln}</tspan>))}
      </text>
      <rect x={cx} y={Math.round(ch*0.36)} width={Math.round(cxW*0.25)} height={Math.max(1.5,Math.round(w*0.016))} rx="1" fill={sc} />
      {[0,1,2,3,4].map(i => (
        <g key={i}>
          <rect x={cx} y={checkY(i)} width={cs} height={cs} rx={Math.round(cs*0.25)} fill={i<3?pc:rgba(pc,0.15)} />
          {i < 3 && <polyline points={`${cx+cs*0.2},${checkY(i)+cs*0.5} ${cx+cs*0.4},${checkY(i)+cs*0.75} ${cx+cs*0.8},${checkY(i)+cs*0.2}`} stroke="white" strokeWidth={Math.max(1,Math.round(w*0.012))} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
          <rect x={cx+cs+Math.round(w*0.04)} y={checkY(i)+cs*0.2} width={Math.round(cxW*(0.6-i*0.06))} height={Math.round(w*0.018)} rx="1" fill="#555" opacity={i<3?0.35:0.15} />
        </g>
      ))}
      <text x={cx} y={ch-Math.round(w*0.06)} fontFamily="Inter,system-ui,sans-serif" fontWeight="700"
        fontSize={brFs} fill="#444" opacity="0.6" letterSpacing="0.05em">{displayBrand.toUpperCase()}</text>
    </>)
  }

  if (kind === 'table') {
    const rowH = Math.round(ch * 0.065)
    const tableY = Math.round(ch * 0.44)
    return shell(<>
      <rect x={sp} y="0" width={cw-sp} height={Math.round(ch*0.3)} fill={`url(#${id}h)`} />
      <rect x={sp} y="0" width={cw-sp} height={Math.round(ch*0.08)} fill="rgba(255,255,255,0.15)" />
      <text x={cx} y={Math.round(ch*0.08)+labFs} fontFamily="Inter,system-ui,sans-serif" fontWeight="700"
        fontSize={labFs} fill={tOnPc} opacity="0.6" letterSpacing="0.1em">PLANTILLA</text>
      <text x={cx} y={Math.round(ch*0.17)+tFs} fontFamily="Inter,system-ui,sans-serif" fontWeight="900"
        fontSize={tFs*0.9} fill={tOnPc} letterSpacing="-0.02em">
        {titleLines.map((ln,i) => (<tspan key={i} x={cx} dy={i===0?0:tFs*1.1}>{ln}</tspan>))}
      </text>
      <rect x={cx} y={Math.round(ch*0.36)} width={Math.round(cxW*0.25)} height={Math.max(1.5,Math.round(w*0.016))} rx="1" fill={sc} />
      <rect x={cx} y={tableY} width={cxW} height={rowH} rx="2" fill={rgba(pc,0.12)} />
      {[0.35,0.65].map((p,i) => (<line key={i} x1={cx+Math.round(cxW*p)} y1={tableY} x2={cx+Math.round(cxW*p)} y2={tableY+rowH*5} stroke={rgba(pc,0.1)} strokeWidth="0.5" />))}
      {[1,2,3,4].map(i => (
        <g key={i}>
          <rect x={cx} y={tableY+rowH*i} width={cxW} height={rowH} rx="0" fill={i%2===0?rgba(pc,0.03):'transparent'} />
          <line x1={cx} y1={tableY+rowH*i} x2={cx+cxW} y2={tableY+rowH*i} stroke={rgba(pc,0.08)} strokeWidth="0.5" />
          <rect x={cx+Math.round(w*0.03)} y={tableY+rowH*i+rowH*0.3} width={Math.round(cxW*0.2)} height={Math.round(w*0.014)} rx="1" fill="#888" opacity={0.25} />
          <rect x={cx+Math.round(cxW*0.38)} y={tableY+rowH*i+rowH*0.3} width={Math.round(cxW*0.18)} height={Math.round(w*0.014)} rx="1" fill="#888" opacity={0.18} />
        </g>
      ))}
      <line x1={cx} y1={tableY+rowH*5} x2={cx+cxW} y2={tableY+rowH*5} stroke={rgba(pc,0.08)} strokeWidth="0.5" />
      <text x={cx} y={ch-Math.round(w*0.06)} fontFamily="Inter,system-ui,sans-serif" fontWeight="700"
        fontSize={brFs} fill="#444" opacity="0.6" letterSpacing="0.05em">{displayBrand.toUpperCase()}</text>
    </>)
  }

  if (kind === 'chart') {
    const barW = Math.round(cxW * 0.14)
    const barGap = Math.round(cxW * 0.04)
    const barBase = Math.round(ch * 0.78)
    const barHeights = [0.55, 0.75, 0.45, 0.9, 0.65]
    const maxBarH = Math.round(ch * 0.3)
    return shell(<>
      <rect x={sp} y="0" width={cw-sp} height={Math.round(ch*0.3)} fill={`url(#${id}h)`} />
      <rect x={sp} y="0" width={cw-sp} height={Math.round(ch*0.08)} fill="rgba(255,255,255,0.15)" />
      <text x={cx} y={Math.round(ch*0.08)+labFs} fontFamily="Inter,system-ui,sans-serif" fontWeight="700"
        fontSize={labFs} fill={tOnPc} opacity="0.6" letterSpacing="0.1em">REPORTE</text>
      <text x={cx} y={Math.round(ch*0.17)+tFs} fontFamily="Inter,system-ui,sans-serif" fontWeight="900"
        fontSize={tFs*0.9} fill={tOnPc} letterSpacing="-0.02em">
        {titleLines.map((ln,i) => (<tspan key={i} x={cx} dy={i===0?0:tFs*1.1}>{ln}</tspan>))}
      </text>
      <rect x={cx} y={Math.round(ch*0.36)} width={Math.round(cxW*0.25)} height={Math.max(1.5,Math.round(w*0.016))} rx="1" fill={sc} />
      <line x1={cx} y1={Math.round(ch*0.45)} x2={cx} y2={barBase} stroke="#ccc" strokeWidth="0.5" />
      <line x1={cx} y1={barBase} x2={cx+cxW} y2={barBase} stroke="#ccc" strokeWidth="0.5" />
      {barHeights.map((p,i) => {
        const bh = Math.round(maxBarH * p)
        const bx = cx + Math.round(w*0.04) + i * (barW + barGap)
        return <rect key={i} x={bx} y={barBase-bh} width={barW} height={bh} rx="2" fill={i===3?sc:rgba(pc, 0.25+i*0.12)} />
      })}
      <text x={cx} y={ch-Math.round(w*0.06)} fontFamily="Inter,system-ui,sans-serif" fontWeight="700"
        fontSize={brFs} fill="#444" opacity="0.6" letterSpacing="0.05em">{displayBrand.toUpperCase()}</text>
    </>)
  }

  // DEFAULT: BOOK
  return shell(<>
    <rect x={sp} y="0" width={cw-sp} height={Math.round(ch*0.36)} fill={`url(#${id}h)`} />
    <rect x={sp} y="0" width={cw-sp} height={Math.round(ch*0.09)} fill="rgba(255,255,255,0.15)" />
    <circle cx={cw-Math.round(w*0.14)} cy={Math.round(ch*0.2)} r={Math.round(w*0.16)} fill="rgba(255,255,255,0.06)" />
    <text x={cx} y={Math.round(ch*0.08)+labFs} fontFamily="Inter,system-ui,sans-serif" fontWeight="700"
      fontSize={labFs} fill={tOnPc} opacity="0.55" letterSpacing="0.12em">GUÍA GRATUITA</text>
    <line x1={cx} y1={Math.round(ch*0.08)+labFs+Math.round(labFs*0.8)}
      x2={cx+Math.round(cxW*0.32)} y2={Math.round(ch*0.08)+labFs+Math.round(labFs*0.8)}
      stroke={tOnPc} strokeWidth="0.5" opacity="0.2" />
    <text x={cx} y={Math.round(ch*0.19)+tFs} fontFamily="Inter,system-ui,sans-serif" fontWeight="900"
      fontSize={tFs} fill={tOnPc} letterSpacing="-0.02em">
      {titleLines.map((ln,i) => (<tspan key={i} x={cx} dy={i===0?0:tFs*1.18}>{ln}</tspan>))}
    </text>
    <rect x={cx} y={Math.round(ch*0.42)} width={Math.round(cxW*0.28)} height={Math.max(1.5,Math.round(w*0.018))} rx="1" fill={sc} />
    <rect x={cx} y={Math.round(ch*0.47)} width={Math.round(cxW*0.9)} height={Math.round(w*0.018)} rx="1" fill="#888" opacity="0.3" />
    <rect x={cx} y={Math.round(ch*0.47)+Math.round(w*0.033)} width={Math.round(cxW*0.7)} height={Math.round(w*0.018)} rx="1" fill="#888" opacity="0.22" />
    <rect x={cx} y={Math.round(ch*0.47)+Math.round(w*0.066)} width={Math.round(cxW*0.8)} height={Math.round(w*0.018)} rx="1" fill="#888" opacity="0.15" />
    <rect x={cx} y={Math.round(ch*0.47)+Math.round(w*0.099)} width={Math.round(cxW*0.5)} height={Math.round(w*0.018)} rx="1" fill="#888" opacity="0.1" />
    <circle cx={Math.round(cw*0.52)} cy={Math.round(ch*0.68)} r={Math.round(w*0.13)} fill={pc} opacity="0.06" />
    <circle cx={Math.round(cw*0.52)} cy={Math.round(ch*0.68)} r={Math.round(w*0.07)} fill={pc} opacity="0.1" />
    <circle cx={Math.round(cw*0.52)} cy={Math.round(ch*0.68)} r={Math.round(w*0.03)} fill={sc} opacity="0.8" />
    <line x1={cx} y1={Math.round(ch*0.68)} x2={cw-8} y2={Math.round(ch*0.68)} stroke={pc} strokeWidth="0.3" opacity="0.07" />
    <line x1={cx} y1={ch-Math.round(w*0.19)} x2={cw-8} y2={ch-Math.round(w*0.19)} stroke="#ddd" strokeWidth="0.5" />
    <text x={cx} y={ch-Math.round(w*0.08)} fontFamily="Inter,system-ui,sans-serif" fontWeight="700"
      fontSize={brFs} fill="#444" opacity="0.65" letterSpacing="0.05em">{displayBrand.toUpperCase()}</text>
    <circle cx={cx+displayBrand.length*brFs*0.58+brFs*0.7} cy={ch-Math.round(w*0.08)-brFs*0.28} r={Math.round(brFs*0.28)} fill={pc} opacity="0.55" />
  </>)
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT NAMES
// ═══════════════════════════════════════════════════════════════════════════════

const VNAMES: Record<number, string> = {
  1: 'Impacto',
  2: 'Pregunta',
  3: 'Número',
  4: 'Beneficio',
  5: 'Urgencia',
  6: 'Social Proof',
}

// ═══════════════════════════════════════════════════════════════════════════════
// BADGE — compact pill for social proof / urgency
// ═══════════════════════════════════════════════════════════════════════════════

const BADGE_TEXT: Record<number, string> = {
  1: '100% Gratuito',
  2: 'Responde esto',
  3: 'Lectura rápida',
  4: 'Resultado garantizado',
  5: 'Últimos lugares',
  6: '+2,500 descargas',
}

function Badge({ text, bg, color, border, fs: fontSize }: { text: string; bg: string; color: string; border?: string; fs: number }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: fontSize * 0.4,
      background: bg, color, fontSize, fontWeight: 700,
      padding: `${fontSize * 0.35}px ${fontSize * 0.9}px`,
      borderRadius: 100, letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
      border: border || 'none', lineHeight: 1.3,
    }}>
      <svg width={fontSize * 0.9} height={fontSize * 0.9} viewBox="0 0 16 16" fill={color}>
        <path d="M8 0L10.2 5.4L16 6.2L11.8 10L12.8 16L8 13.2L3.2 16L4.2 10L0 6.2L5.8 5.4L8 0Z" />
      </svg>
      {text}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AD CANVAS — ONE clean layout, 6 text variations
// ═══════════════════════════════════════════════════════════════════════════════

interface CP { variant: number; data: AdData; size: number }

function AdCanvas({ variant, data, size: S }: CP) {
  const { headline, subheadline, primaryColor: pc, secondaryColor: sc, leadMagnetType: lmt } = data
  const txtOnPc = isLight(pc) ? '#0a0a0a' : '#ffffff'
  const subOnPc = isLight(pc) ? 'rgba(10,10,10,0.6)' : 'rgba(255,255,255,0.65)'
  const badgeBg = isLight(pc) ? rgba('#000', 0.08) : rgba('#fff', 0.12)
  const badgeBorder = isLight(pc) ? `1px solid ${rgba('#000', 0.1)}` : `1px solid ${rgba('#fff', 0.15)}`

  const f = (n: number) => Math.round((n / 400) * S)
  const ew = Math.round(S * 0.38) // 40%+ of width for mockup

  return (
    <div style={{
      width: S, height: S,
      position: 'relative', overflow: 'hidden',
      fontFamily: FONT,
      // Solid bg + subtle radial diffusion in corners
      background: pc,
    }}>
      {/* Subtle radial diffusion — secondary color at corners */}
      <div style={{ position: 'absolute', top: -S * 0.15, right: -S * 0.15, width: S * 0.6, height: S * 0.6, borderRadius: '50%', background: `radial-gradient(circle, ${rgba(sc, 0.15)} 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', bottom: -S * 0.1, left: -S * 0.1, width: S * 0.5, height: S * 0.5, borderRadius: '50%', background: `radial-gradient(circle, ${rgba(sc, 0.08)} 0%, transparent 70%)` }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        padding: `${f(22)}px ${f(24)}px ${f(18)}px`,
        gap: f(14),
      }}>
        {/* Badge */}
        <Badge
          text={BADGE_TEXT[variant] || '100% Gratuito'}
          bg={badgeBg} color={txtOnPc} border={badgeBorder}
          fs={f(9)}
        />

        {/* Headline */}
        <h2 style={{
          color: txtOnPc,
          fontSize: headline.split(' ').length <= 4 ? f(36) : f(28),
          fontWeight: 900,
          lineHeight: 1.1,
          margin: 0,
          letterSpacing: '-1.2px',
          maxWidth: '92%',
        }}>{headline}</h2>

        {/* Subheadline */}
        <p style={{
          color: subOnPc,
          fontSize: f(12),
          lineHeight: 1.55,
          margin: 0,
          maxWidth: '85%',
        }}>{subheadline}</p>

        {/* Mockup — hero element, large and centered */}
        <div style={{
          flex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          filter: `drop-shadow(0 8px 16px rgba(0,0,0,0.25)) drop-shadow(0 20px 40px rgba(0,0,0,0.15))`,
        }}>
          <LeadMagnetMockup
            pc={pc} sc={sc}
            w={ew}
            id={`v${variant}`}
            title={headline}
            type={lmt}
          />
        </div>
      </div>
    </div>
  )
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
