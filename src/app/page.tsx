'use client'

import { useState } from 'react'
import AdForm, { FormInput, LeadMagnetType } from './components/AdForm'
import AdVariation from './components/AdVariation'

export interface AdData {
  headline: string
  subheadline: string
  cta: string
  primaryColor: string
  secondaryColor: string
  leadMagnetType: LeadMagnetType
}

interface VariationDecision {
  id: number
  nombre: string
  razonamiento: string
}

interface GeneratedState {
  adData: AdData
  variaciones: VariationDecision[]
}

const DEFAULT_FORM: FormInput = {
  brand: '',
  audience: '',
  objetivo: '',
  leadMagnetType: 'Ebook / Guía',
  primaryColor: '#6366f1',
  secondaryColor: '#f59e0b',
}

const VARIANTS = [1, 2, 3, 4, 5, 6]

export default function Home() {
  const [formInput, setFormInput] = useState<FormInput>(DEFAULT_FORM)
  const [generated, setGenerated] = useState<GeneratedState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/creative-director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formInput),
      })

      const json = await res.json()

      if (!json.success) {
        setError(json.error ?? 'Error desconocido al generar.')
        return
      }

      const { headline, subheadline, cta, variaciones } = json.data

      setGenerated({
        adData: {
          headline,
          subheadline,
          cta,
          primaryColor: formInput.primaryColor,
          secondaryColor: formInput.secondaryColor,
          leadMagnetType: formInput.leadMagnetType,
        },
        variaciones,
      })
    } catch {
      setError('No se pudo conectar con la API. Verifica tu conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 32px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
              Ad Creative Generator
            </h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>
              Director creativo con IA · 6 variaciones · 1080 × 1080 px
            </p>
          </div>

          {generated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#10b981', fontWeight: 600, background: '#f0fdf4', padding: '6px 14px', borderRadius: 100, border: '1px solid #bbf7d0' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              6 variaciones generadas
            </div>
          )}
        </div>
      </header>

      {/* Layout */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '32px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <aside style={{ width: 300, flexShrink: 0 }}>
          <AdForm
            data={formInput}
            onChange={setFormInput}
            onGenerate={handleGenerate}
            loading={loading}
          />
        </aside>

        {/* Main content */}
        <div style={{ flex: 1 }}>
          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <svg width="16" height="16" style={{ flexShrink: 0, marginTop: 1 }} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#dc2626', margin: '0 0 2px' }}>Error al generar</p>
                <p style={{ fontSize: 13, color: '#991b1b', margin: 0 }}>{error}</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!generated && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 480, textAlign: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Configura tu anuncio</p>
                <p style={{ fontSize: 14, color: '#9ca3af', margin: 0, maxWidth: 340, lineHeight: 1.5 }}>
                  Ingresa tu marca, audiencia y objetivo en el panel izquierdo. Claude generará el copy optimizado y analizará cada layout para maximizar conversiones.
                </p>
              </div>
            </div>
          )}

          {/* Skeleton loading */}
          {loading && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, background: '#fff', padding: '12px 16px', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Claude está analizando tu brief y generando las variaciones...</span>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                {VARIANTS.map((v) => (
                  <AdVariation key={v} variant={v} data={{ headline: '', subheadline: '', cta: '', primaryColor: '#6366f1', secondaryColor: '#f59e0b', leadMagnetType: 'Ebook / Guía' }} skeleton />
                ))}
              </div>
            </>
          )}

          {/* Generated results */}
          {generated && !loading && (
            <>
              {/* Copy generado */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
                  </svg>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Copy generado por Claude</span>
                </div>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', flex: 1 }}>
                  <span style={{ fontSize: 13, color: '#374151' }}><strong style={{ color: '#111827' }}>Headline:</strong> {generated.adData.headline}</span>
                  <span style={{ fontSize: 13, color: '#374151' }}><strong style={{ color: '#111827' }}>CTA:</strong> {generated.adData.cta}</span>
                </div>
              </div>

              {/* Grid de variaciones */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                {VARIANTS.map((v) => {
                  const decision = generated.variaciones.find((d) => d.id === v)
                  return (
                    <AdVariation
                      key={v}
                      variant={v}
                      data={generated.adData}
                      razonamiento={decision?.razonamiento}
                    />
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
