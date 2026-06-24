import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt     = 'SocialPro — Carrosséis para Instagram com IA';
export const size    = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #11131b 0%, #0d0f1a 50%, #11131b 100%)',
          fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-100px', left: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
            </svg>
          </div>
          <span style={{ fontSize: '42px', fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>
            Social<span style={{ background: 'linear-gradient(to right, #06b6d4, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pro</span>
          </span>
        </div>

        {/* Headline */}
        <div style={{ textAlign: 'center', maxWidth: '800px', padding: '0 40px' }}>
          <h1 style={{ fontSize: '52px', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.15, letterSpacing: '-2px' }}>
            Carrosséis virais para
          </h1>
          <h1 style={{ fontSize: '52px', fontWeight: 800, margin: '4px 0 0', lineHeight: 1.15, letterSpacing: '-2px',
            background: 'linear-gradient(to right, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Instagram com IA
          </h1>
          <p style={{ fontSize: '22px', color: '#8f95a5', marginTop: '20px', fontWeight: 400 }}>
            Texto + imagens + publicação automática em segundos
          </p>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
          {['gpt-image-2', 'Windmill AI', 'Instagram API'].map(tag => (
            <div key={tag} style={{
              padding: '8px 16px', borderRadius: '100px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#8f95a5', fontSize: '14px', fontWeight: 600,
            }}>
              {tag}
            </div>
          ))}
        </div>

        {/* URL */}
        <p style={{ position: 'absolute', bottom: '24px', color: '#4a5568', fontSize: '16px', fontWeight: 600 }}>
          socialproai.com
        </p>
      </div>
    ),
    { ...size }
  );
}
