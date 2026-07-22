import re

file_path = 'C:/Mazaika/mazaika-app/src/pages/ai/AiWorkspacePage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

helper_func = """
const renderCanvasBlock = (b: any, bIdx: number, activeConfig: any) => {
  return (
    <div 
      key={b.id || bIdx} 
      className="canvas-block-wrapper"
      style={{ 
        animationDelay: `${bIdx * 0.15}s`, 
        marginBottom: 16, 
        padding: 12, 
        borderRadius: 12, 
        background: activeConfig.theme === 'minimalist' ? '#fff' : 'rgba(255,255,255,0.04)', 
        border: '1px solid rgba(255,255,255,0.08)' 
      }}
    >
      {b.type === 'hero' && (
        <div>
          {b.img && <img src={b.img} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>{b.title}</h4>
          <p style={{ fontSize: 11, color: activeConfig.theme === 'minimalist' ? '#64748b' : '#94a3b8', margin: '4px 0 8px 0' }}>{b.subtitle}</p>
          <button style={{ background: activeConfig.themeColor || '#1e90ff', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{b.ctaText || 'Batafsil'}</button>
        </div>
      )}

      {b.type === 'about' && (
        <div>
          <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{b.title}</h4>
          <p style={{ fontSize: 11, color: activeConfig.theme === 'minimalist' ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>{b.text}</p>
        </div>
      )}

      {b.type === 'catalog' && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 700 }}>{b.title}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(Array.isArray(b.items) ? b.items : []).map((item: any, iIdx: number) => (
              <div key={item.id || iIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 6, borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, display: 'block' }}>{item.name}</span>
                  <span style={{ fontSize: 10, color: activeConfig.themeColor || '#1e90ff' }}>{item.price?.toLocaleString()} so'm</span>
                </div>
                <button style={{ background: 'rgba(30,144,255,0.1)', border: '1px solid #1e90ff', color: '#1e90ff', borderRadius: 4, padding: '2px 8px', fontSize: 10 }}>+ Savat</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {b.type === 'form' && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 700 }}>{b.title}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(Array.isArray(b.fields) ? b.fields : []).map((f: any, idx: number) => (
              <div key={idx}>
                <label style={{ display: 'block', fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>{f.label}</label>
                <input type="text" disabled placeholder={f.label} style={{ width: '100%', padding: 4, fontSize: 10, borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {b.type === 'voting' && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 700 }}>{b.title}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(Array.isArray(b.candidates) ? b.candidates : []).map((cand: any, idx: number) => (
              <button key={idx} style={{ textAlign: 'left', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 11, cursor: 'pointer' }}>
                {typeof cand === 'string' ? cand : cand.name || 'Nomzod'}
              </button>
            ))}
          </div>
        </div>
      )}

      {b.type === 'loyalty' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 700 }}>{b.title}</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#10d974' }}>15,000 pts</span>
        </div>
      )}

      {b.type === 'contacts' && (
        <div>
          <h4 style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>{b.title}</h4>
          <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginTop: 4 }}>📞 {b.phone}</span>
          <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>💬 @{b.telegram}</span>
        </div>
      )}

      {['boshlash', 'xabar', 'matnli_savol', 'shart'].includes(b.type) && (
        <div style={{ borderLeft: `3px solid ${activeConfig.themeColor || "#8b5cf6"}`, paddingLeft: 8 }}>
          <h4 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>Node: {b.title} <span style={{ fontSize: 9, opacity: 0.6, background: '#334155', padding: '2px 4px', borderRadius: 4 }}>{b.type}</span></h4>
          {b.text && <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0 0' }}>{b.text}</p>}
          {b.condition && <p style={{ fontSize: 10, color: '#fbbf24', margin: '4px 0 0 0', fontFamily: 'monospace' }}>if ({b.condition})</p>}
          {b.variable && <p style={{ fontSize: 10, color: '#38bdf8', margin: '4px 0 0 0', fontFamily: 'monospace' }}>-{'>'} {b.variable}</p>}
          
          {Array.isArray(b.buttons) && b.buttons.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
              {b.buttons.map((btn: any, i: number) => (
                <span key={i} style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0' }}>{typeof btn === 'string' ? btn : btn.text || 'Tugma'}</span>
              ))}
            </div>
          )}
        </div>
      )}
      
      {b.type === 'quiz' && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 700 }}>{b.title || 'Testing / Quiz'}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(Array.isArray(b.questions) ? b.questions : []).map((q: any, idx: number) => (
              <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 8 }}>
                <p style={{ fontSize: 11, margin: '0 0 6px 0', color: '#e2e8f0' }}>{idx + 1}. {q.q || q.question}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {(Array.isArray(q.options) ? q.options : []).map((opt: any, oIdx: number) => (
                    <span key={oIdx} style={{ fontSize: 10, padding: '4px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, color: '#94a3b8', cursor: 'pointer' }}>{typeof opt === 'string' ? opt : opt.text || opt.label || 'Variant'}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
"""

content = content.replace('export default function AiWorkspacePage() {', helper_func + '\nexport default function AiWorkspacePage() {')

new_render = """
              {/* Dynamic Preview Shell */}
              {activeConfig.target_entity === 'bot_and_mini_app' ? (
                <div style={{ display: 'flex', flexDirection: 'row', gap: 24, width: '100%', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  
                  {/* Left: Bot Shell */}
                  <div className="ai-constructor-shell" style={{ flex: 1, minWidth: 320, maxWidth: 500, height: 600, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 40, background: '#1e293b', display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Bot size={14} style={{ color: '#a855f7' }} /> Bot Constructor Board
                      </div>
                    </div>
                    <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: '#090d16' }}>
                      {(Array.isArray(activeConfig.bot_blocks) ? activeConfig.bot_blocks : []).map((b: any, bIdx: number) => renderCanvasBlock(b, bIdx, activeConfig))}
                    </div>
                  </div>

                  {/* Right: Mini App Shell */}
                  <div className="ai-phone-shell" style={{ flex: 'none', height: 600, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 24, background: '#090d16', display: 'flex', justifyContent: 'space-between', padding: '4px 20px', fontSize: 10, color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <span>9:41</span>
                      <div style={{ display: 'flex', gap: 4 }}><span>📶</span><span>🔋</span></div>
                    </div>
                    <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: activeConfig.theme === 'minimalist' ? '#f8fafc' : activeConfig.theme === 'neon' ? '#05050d' : '#090d16', color: activeConfig.theme === 'minimalist' ? '#0f172a' : '#fff' }}>
                      <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16, fontWeight: 900, color: activeConfig.themeColor || '#1e90ff' }}>
                        🏆 {activeConfig.appName}
                      </div>
                      {(Array.isArray(activeConfig.site_blocks) ? activeConfig.site_blocks : []).map((b: any, bIdx: number) => renderCanvasBlock(b, bIdx, activeConfig))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={
                  activeConfig.target_entity === 'bot' ? 'ai-constructor-shell' : 
                  activeConfig.target_entity === 'site' ? 'ai-desktop-shell' : 
                  'ai-phone-shell'
                }>
                  {/* Only show status bar for phones */}
                  {activeConfig.target_entity !== 'bot' && activeConfig.target_entity !== 'site' && (
                    <div style={{ height: 24, background: '#090d16', display: 'flex', justifyContent: 'space-between', padding: '4px 20px', fontSize: 10, color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <span>9:41</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <span>📶</span>
                        <span>🔋</span>
                      </div>
                    </div>
                  )}
                  {/* Browser toolbar for sites */}
                  {activeConfig.target_entity === 'site' && (
                    <div style={{ height: 32, background: '#1e293b', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></div>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#eab308' }}></div>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }}></div>
                      </div>
                      <div style={{ flex: 1, background: '#0f172a', height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 10, color: '#94a3b8' }}>
                        <Globe size={10} style={{ marginRight: 6 }} /> mazaika-live.com
                      </div>
                    </div>
                  )}
                  {/* Constructor toolbar for bots */}
                  {activeConfig.target_entity === 'bot' && (
                    <div style={{ height: 40, background: '#1e293b', display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Bot size={14} style={{ color: '#a855f7' }} /> Bot Constructor Board
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>
                        Drag & Drop Nodes Enabled
                      </div>
                    </div>
                  )}

                  {/* Render Mock Canvas */}
                  <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: activeConfig.theme === 'minimalist' ? '#f8fafc' : activeConfig.theme === 'neon' ? '#05050d' : '#090d16', color: activeConfig.theme === 'minimalist' ? '#0f172a' : '#fff' }}>
                    
                    {/* Header Bar */}
                    <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16, fontWeight: 900, color: activeConfig.themeColor || '#1e90ff' }}>
                      🏆 {activeConfig.appName}
                    </div>

                    {/* Render Generated Blocks */}
                    {(Array.isArray(activeConfig.blocks) ? activeConfig.blocks : []).map((b: any, bIdx: number) => renderCanvasBlock(b, bIdx, activeConfig))}

                  </div>
                </div>
              )}
"""

pattern = re.compile(r'\{\s*/\*\s*Dynamic Preview Shell\s*\*/\s*\}.*?</div>\s*</div>\s*</div>\s*</div>', re.DOTALL)
content = pattern.sub(new_render.strip(), content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch successful!")
