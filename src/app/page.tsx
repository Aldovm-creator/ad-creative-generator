'use client'

import { useState } from 'react'
import AdForm from './components/AdForm'
import AdVariation from './components/AdVariation'

export interface AdData {
  headline: string
  subheadline: string
  cta: string
  primaryColor: string
  secondaryColor: string
}

const defaultData: AdData = {
  headline: 'Tu Marca, Tu Historia',
  subheadline: 'Una propuesta de valor irresistible para tu audiencia objetivo.',
  cta: 'Comenzar ahora',
  primaryColor: '#6366f1',
  secondaryColor: '#f59e0b',
}

const VARIANTS = [1, 2, 3, 4, 5, 6]

export default function Home() {
  const [adData, setAdData] = useState<AdData>(defaultData)

  return (
    <main className="min-h-screen" style={{ background: '#f3f4f6' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 32px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
              Ad Creative Generator
            </h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>
              Genera 6 variaciones visuales para tus anuncios
            </p>
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', background: '#f9fafb', padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            Formato 1:1 · 1080 × 1080 px
          </div>
        </div>
      </header>

      {/* Layout */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '32px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <aside style={{ width: 300, flexShrink: 0 }}>
          <AdForm data={adData} onChange={setAdData} />
        </aside>

        {/* Grid de variaciones */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {VARIANTS.map((v) => (
            <AdVariation key={v} variant={v} data={adData} />
          ))}
        </div>
      </div>
    </main>
  )
}
