import React, { useState, useRef } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import type { Block } from './SiteBuilderPage'

interface BuilderBlockProps {
  block: Block
  config: any
  isActive: boolean
  onClick: () => void
  onUpdateBlock: (updatedBlock: Block) => void
  viewMode?: 'desktop' | 'mobile'
}

export default function BuilderBlock({ block, config, isActive, onClick, onUpdateBlock, viewMode = 'desktop' }: BuilderBlockProps) {
  const controls = useDragControls()
  const timerRef = useRef<any>(null)
  
  const [paddingTop, setPaddingTop] = useState(block.styles?.paddingTop ?? (viewMode === 'desktop' ? 24 : 16))
  const [paddingBottom, setPaddingBottom] = useState(block.styles?.paddingBottom ?? (viewMode === 'desktop' ? 24 : 16))
  const [isResizing, setIsResizing] = useState(false)

  // Long press to drag
  const handlePointerDown = (e: React.PointerEvent) => {
    timerRef.current = setTimeout(() => {
      controls.start(e)
    }, 400) // 400ms hold to drag
  }

  const cancelLongPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  // Resize handler
  const handleResizeStart = (e: React.MouseEvent, direction: 'top' | 'bottom') => {
    e.stopPropagation()
    setIsResizing(true)
    const startY = e.clientY
    const startValue = direction === 'top' ? paddingTop : paddingBottom
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY
      if (direction === 'top') {
        setPaddingTop(Math.max(0, startValue + delta))
      } else {
        setPaddingBottom(Math.max(0, startValue + delta))
      }
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      setIsResizing(false)
      
      // Save changes
      setPaddingTop(currentTop => {
        setPaddingBottom(currentBottom => {
          onUpdateBlock({
            ...block,
            styles: { ...block.styles, paddingTop: currentTop, paddingBottom: currentBottom }
          })
          return currentBottom
        })
        return currentTop
      })
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const isBotNode = ['boshlash', 'xabar', 'shart', 'matnli_savol'].includes(block.type)
  const isMobile = viewMode === 'mobile'

  return (
    <Reorder.Item 
      value={block} 
      id={block.id}
      dragListener={false} 
      dragControls={controls}
      style={{ position: 'relative', touchAction: 'none' }}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', 
        zIndex: 50 
      }}
    >
      <div 
        onClick={onClick}
        onPointerDown={handlePointerDown}
        onPointerUp={cancelLongPress}
        onPointerMove={cancelLongPress}
        onPointerLeave={cancelLongPress}
        style={{
          position: 'relative',
          paddingTop: `${paddingTop}px`,
          paddingBottom: `${paddingBottom}px`,
          paddingLeft: isMobile ? '16px' : '24px',
          paddingRight: isMobile ? '16px' : '24px',
          marginBottom: isMobile ? '16px' : '24px',
          borderRadius: isMobile ? '12px' : '16px',
          border: isActive 
            ? `2px ${isMobile ? 'dashed' : 'solid'} ${config.themeColor}` 
            : `1px solid ${isMobile ? 'rgba(255,255,255,0.03)' : 'transparent'}`,
          background: config.theme === 'minimalist' 
            ? (isActive ? (isMobile ? '#e2e8f0' : '#f0f7ff') : (isMobile ? '#f1f5f9' : '#f8fafc')) 
            : (isActive ? 'rgba(30,144,255,0.05)' : (isMobile ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)')),
          boxShadow: isActive && !isMobile ? '0 10px 25px rgba(30,144,255,0.1)' : 'none',
          cursor: 'pointer',
          transition: isResizing ? 'none' : 'background 0.2s, border 0.2s',
          userSelect: 'none'
        }}
      >
        {isActive && !isMobile && (
          <div style={{ 
            position: 'absolute', top: -10, left: 16, 
            background: config.themeColor, color: '#fff', 
            fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
            zIndex: 10
          }}>
            TAHRIRLASH
          </div>
        )}

        {isBotNode && (
           <div style={{ textAlign: 'center', padding: isMobile ? '10px' : '20px', background: 'rgba(255,0,0,0.1)', borderRadius: 12, border: '1px dashed red' }}>
             <h3 style={{ margin: 0, color: 'red', fontSize: isMobile ? 12 : 18 }}>🤖 Логический узел бота ({block.type})</h3>
             {!isMobile && <p style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>Этот блок предназначен для логики бота va saytda ko'rinmaydi.</p>}
           </div>
        )}

        {/* HERO BLOCK */}
        {block.type === 'hero' && (
          isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {block.img && <img src={block.img} alt="Hero" style={{ width: '100%', height: 110, borderRadius: 8, objectFit: 'cover', pointerEvents: 'none' }} />}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 800, margin: '0 0 4px 0' }}>{block.title}</h4>
                <p style={{ fontSize: 10, opacity: 0.8, margin: '0 0 10px 0', lineHeight: 1.4 }}>{block.subtitle}</p>
                <button style={{ background: config.themeColor, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, fontSize: 9, fontWeight: 700 }}>
                  {block.ctaText}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: block.img ? '1fr 1fr' : '1fr', gap: 32, alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>{block.title || 'Sarlavha'}</h1>
                <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 20, lineHeight: 1.6 }}>{block.subtitle || 'Kompaniya shiori...'}</p>
                <button style={{ background: config.themeColor, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                  {block.ctaText || 'Batafsil'}
                </button>
              </div>
              {block.img && (
                <img src={block.img} alt="Hero image" style={{ width: '100%', height: 260, borderRadius: 16, objectFit: 'cover', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', pointerEvents: 'none' }} />
              )}
            </div>
          )
        )}

        {/* ABOUT BLOCK */}
        {block.type === 'about' && (
          isMobile ? (
            <div>
              <h5 style={{ fontSize: 12, fontWeight: 800, margin: '0 0 6px 0', color: config.themeColor }}>{block.title}</h5>
              <p style={{ fontSize: 10, lineHeight: 1.5, opacity: 0.8, margin: 0 }}>{block.text}</p>
            </div>
          ) : (
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: config.themeColor }}>{block.title || 'Biz haqimizda'}</h2>
              <p style={{ fontSize: 14, lineHeight: 1.8, opacity: 0.8 }}>{block.text || 'Matn...'}</p>
            </div>
          )
        )}

        {/* CATALOG BLOCK */}
        {block.type === 'catalog' && (
          isMobile ? (
            <div>
              <h5 style={{ fontSize: 12, fontWeight: 800, margin: '0 0 10px 0', color: config.themeColor, textAlign: 'center' }}>{block.title || 'Bizning Katalog'}</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(block.items || []).map(item => (
                  <div key={item.id} style={{ 
                    background: config.theme === 'minimalist' ? '#fff' : 'rgba(0,0,0,0.2)', 
                    borderRadius: 12, 
                    border: '1px solid rgba(255,255,255,0.03)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ position: 'relative', width: '100%', paddingTop: '100%', background: 'rgba(255,255,255,0.02)' }}>
                      {item.img ? (
                        <img 
                          src={item.img} 
                          alt={item.name} 
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} 
                        />
                      ) : (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 9 }}>
                          Rasm yo'q
                        </div>
                      )}
                    </div>
                    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4, flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <h6 style={{ margin: 0, fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '14px', height: '28px' }}>
                          {item.name}
                        </h6>
                        {item.desc && (
                          <p style={{ margin: 0, fontSize: 9, opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.desc}>
                            {item.desc}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: config.themeColor, fontWeight: 800 }}>
                          {item.price.toLocaleString()} UZS
                        </span>
                        <button style={{ background: config.themeColor, color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 9, fontWeight: 700, cursor: 'pointer', width: '100%', textAlign: 'center' }}>
                          + Savatga
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, color: config.themeColor, textAlign: 'center' }}>{block.title || 'Do\'kon / Katalog'}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {(block.items || []).map((item) => (
                  <div key={item.id} style={{ background: config.theme === 'minimalist' ? '#fff' : 'rgba(15,23,42,0.4)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {item.img && <img src={item.img} alt={item.name} style={{ width: '100%', height: 140, objectFit: 'cover', pointerEvents: 'none' }} />}
                    <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 700 }}>{item.name}</h4>
                        <p style={{ margin: '0 0 12px 0', fontSize: 11, opacity: 0.6 }}>{item.desc}</p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: config.themeColor }}>{item.price.toLocaleString()} UZS</span>
                        <button style={{ background: 'none', border: `1px solid ${config.themeColor}`, color: config.themeColor, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
                          Savatga
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* BLOG BLOCK */}
        {block.type === 'blog' && (
          isMobile ? (
            <div>
              <h5 style={{ fontSize: 12, fontWeight: 800, margin: '0 0 8px 0', color: config.themeColor }}>{block.title || 'Yangiliklar'}</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(block.posts || []).map(post => (
                  <div key={post.id} style={{ padding: 8, borderLeft: `2.5px solid ${config.themeColor}`, background: 'rgba(255,255,255,0.02)', borderRadius: '0 4px 4px 0' }}>
                    <h6 style={{ margin: '0 0 2px 0', fontSize: 11, fontWeight: 700 }}>{post.title}</h6>
                    <p style={{ margin: 0, fontSize: 9, opacity: 0.8, lineHeight: 1.3 }}>{post.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, color: config.themeColor }}>{block.title || 'Yangiliklar'}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {(block.posts || []).map(post => (
                  <div key={post.id} style={{ padding: 16, borderRadius: 12, background: config.theme === 'minimalist' ? '#f1f5f9' : 'rgba(255,255,255,0.01)', borderLeft: `4px solid ${config.themeColor}` }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: 15, fontWeight: 700 }}>{post.title}</h4>
                    <p style={{ margin: 0, fontSize: 12, opacity: 0.8, lineHeight: 1.5 }}>{post.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* CONTACTS BLOCK */}
        {block.type === 'contacts' && (
          isMobile ? (
            <div style={{ textAlign: 'center', padding: '4px 0' }}>
              <h5 style={{ fontSize: 11, fontWeight: 800, margin: '0 0 6px 0', color: config.themeColor }}>{block.title || 'Aloqa'}</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10 }}>
                {block.phone && <div>📞 {block.phone}</div>}
                {block.telegram && <div>✈ @{block.telegram}</div>}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: config.themeColor }}>{block.title || 'Kontaktlar'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                {block.phone && <div>📞 Telefon: <strong>{block.phone}</strong></div>}
                {block.telegram && <div>✈ Telegram: <strong>@{block.telegram}</strong></div>}
              </div>
            </div>
          )
        )}

        {/* FORM BLOCK */}
        {block.type === 'form' && (
          isMobile ? (
            <div>
              <h5 style={{ fontSize: 12, fontWeight: 800, margin: '0 0 8px 0', color: config.themeColor }}>{block.title || 'So\'rovnoma'}</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(block.fields || []).map(f => (
                  <div key={f.name}>
                    <label style={{ display: 'block', fontSize: 9, marginBottom: 2, opacity: 0.7 }}>{f.label}</label>
                    <input type={f.type} placeholder={f.label} disabled className="input" style={{ width: '100%', padding: '5px 8px', fontSize: 10 }} />
                  </div>
                ))}
                <button style={{ background: config.themeColor, color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, marginTop: 4 }}>
                  Yuborish (Submit)
                </button>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: config.themeColor }}>{block.title || 'Mijoz arizasi'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(block.fields || []).map(f => (
                  <div key={f.name}>
                    <label style={{ display: 'block', fontSize: 11, marginBottom: 4, opacity: 0.7 }}>{f.label}</label>
                    <input type={f.type} className="input" placeholder={f.label} disabled style={{ width: '100%', fontSize: 12 }} />
                  </div>
                ))}
                <button style={{ background: config.themeColor, color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, alignSelf: 'flex-start', marginTop: 4 }}>
                  Ariza yuborish
                </button>
              </div>
            </div>
          )
        )}

        {/* LOYALTY BLOCK */}
        {block.type === 'loyalty' && (
          isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(16,217,116,0.06)', border: '1px solid #10d974', borderRadius: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 12, color: '#10d974', fontWeight: 800 }}>{block.title || 'Mijoz cashback balansi'}</h3>
                <p style={{ margin: 0, fontSize: 9, opacity: 0.6 }}>Telegram orqali avtomatik aniqlanadi</p>
              </div>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#10d974' }}>75,000 ball</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'rgba(16,217,116,0.06)', border: '1px solid #10d974', borderRadius: 12, maxWidth: 600, margin: '0 auto' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: '#10d974', fontWeight: 800 }}>{block.title || 'Mijoz cashback balansi'}</h3>
                <p style={{ margin: 0, fontSize: 11, opacity: 0.6 }}>Telegram orqali avtomatik aniqlanadi</p>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#10d974' }}>75,000 ball</span>
            </div>
          )
        )}

        {/* VOTING BLOCK */}
        {block.type === 'voting' && (
          isMobile ? (
            <div>
              <h5 style={{ fontSize: 12, fontWeight: 800, margin: '0 0 8px 0', color: config.themeColor }}>{block.title || 'Ovoz berish'}</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(block.candidates || []).map((cand, cidx) => (
                  <label key={cidx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <input type="radio" disabled />
                    <span>{cand}</span>
                  </label>
                ))}
                <button style={{ background: config.themeColor, color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, marginTop: 4 }}>
                  Ovoz berish
                </button>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: config.themeColor }}>{block.title || 'Ovoz berish'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(block.candidates || []).map((cand, cidx) => (
                  <label key={cidx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <input type="radio" disabled />
                    <span>{cand}</span>
                  </label>
                ))}
                <button style={{ background: config.themeColor, color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, alignSelf: 'flex-start', marginTop: 4 }}>
                  Ovoz berish
                </button>
              </div>
            </div>
          )
        )}

        {/* Resize Handles */}
        {isActive && (
          <>
            {/* Top Handle */}
            <div 
              onMouseDown={(e) => handleResizeStart(e, 'top')}
              style={{ 
                position: 'absolute', top: -5, left: 0, right: 0, height: 10, 
                cursor: 'row-resize', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20 
              }}
            >
              <div style={{ width: 40, height: 4, background: config.themeColor, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            </div>
            {/* Bottom Handle */}
            <div 
              onMouseDown={(e) => handleResizeStart(e, 'bottom')}
              style={{ 
                position: 'absolute', bottom: -5, left: 0, right: 0, height: 10, 
                cursor: 'row-resize', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20 
              }}
            >
              <div style={{ width: 40, height: 4, background: config.themeColor, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            </div>
          </>
        )}
      </div>
    </Reorder.Item>
  )
}
