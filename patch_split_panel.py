import re

file_path = 'C:/Mazaika/mazaika-app/src/pages/ai/AiWorkspacePage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the entire Right Live Preview Panel logic

new_preview_logic = """        {/* Right Live Preview Panel */}
        <div className="ai-preview-panel" style={{ padding: 16 }}>
          {activeConfig ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
                <Globe size={14} style={{ color: '#10d974' }} />
                <span>Live AI Dynamic Canvas (Mazaika Generative Engine)</span>
              </div>

              {activeConfig.target_entity === 'bot_and_mini_app' ? (
                <div style={{ display: 'flex', gap: 24, flex: 1, width: '100%', justifyContent: 'center' }}>
                  {/* Left Shell: BOT CONSTRUCTOR */}
                  <div className="ai-constructor-shell" style={{ height: '100%', flex: 1, maxWidth: 400, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 40, background: '#1e293b', display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Bot size={14} style={{ color: '#a855f7' }} /> Bot Constructor
                      </div>
                    </div>
                    <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: activeConfig.theme === 'minimalist' ? '#f8fafc' : activeConfig.theme === 'neon' ? '#05050d' : '#090d16', color: activeConfig.theme === 'minimalist' ? '#0f172a' : '#fff' }}>
                      <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16, fontWeight: 900, color: activeConfig.themeColor || '#1e90ff' }}>
                        🏆 {activeConfig.appName} (Bot Logic)
                      </div>
                      {(activeConfig.bot_blocks || []).map((b: any, bIdx: number) => renderCanvasBlock(b, bIdx, activeConfig))}
                    </div>
                  </div>

                  {/* Right Shell: MINI APP (Phone) */}
                  <div className="ai-phone-shell" style={{ height: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 24, background: '#090d16', display: 'flex', justifyContent: 'space-between', padding: '4px 20px', fontSize: 10, color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <span>9:41</span><div style={{ display: 'flex', gap: 4 }}><span>📶</span><span>🔋</span></div>
                    </div>
                    <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: activeConfig.theme === 'minimalist' ? '#f8fafc' : activeConfig.theme === 'neon' ? '#05050d' : '#090d16', color: activeConfig.theme === 'minimalist' ? '#0f172a' : '#fff' }}>
                      <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16, fontWeight: 900, color: activeConfig.themeColor || '#1e90ff' }}>
                        📱 {activeConfig.appName} (Mini App UI)
                      </div>
                      {(activeConfig.site_blocks || []).map((b: any, bIdx: number) => renderCanvasBlock(b, bIdx, activeConfig))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={
                  activeConfig.target_entity === 'bot' ? 'ai-constructor-shell' : 
                  activeConfig.target_entity === 'site' ? 'ai-desktop-shell' : 
                  'ai-phone-shell'
                }>
                  {activeConfig.target_entity !== 'bot' && activeConfig.target_entity !== 'site' && (
                    <div style={{ height: 24, background: '#090d16', display: 'flex', justifyContent: 'space-between', padding: '4px 20px', fontSize: 10, color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <span>9:41</span><div style={{ display: 'flex', gap: 4 }}><span>📶</span><span>🔋</span></div>
                    </div>
                  )}
                  {activeConfig.target_entity === 'site' && (
                    <div style={{ height: 32, background: '#1e293b', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></div><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#eab308' }}></div><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }}></div></div>
                      <div style={{ flex: 1, background: '#0f172a', height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 10, color: '#94a3b8' }}><Globe size={10} style={{ marginRight: 6 }} /> mazaika-live.com</div>
                    </div>
                  )}
                  {activeConfig.target_entity === 'bot' && (
                    <div style={{ height: 40, background: '#1e293b', display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Bot size={14} style={{ color: '#a855f7' }} /> Bot Constructor Board</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>Drag & Drop Nodes Enabled</div>
                    </div>
                  )}
                  <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: activeConfig.theme === 'minimalist' ? '#f8fafc' : activeConfig.theme === 'neon' ? '#05050d' : '#090d16', color: activeConfig.theme === 'minimalist' ? '#0f172a' : '#fff' }}>
                    <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16, fontWeight: 900, color: activeConfig.themeColor || '#1e90ff' }}>
                      🏆 {activeConfig.appName}
                    </div>
                    {(Array.isArray(activeConfig.blocks) ? activeConfig.blocks : []).map((b: any, bIdx: number) => renderCanvasBlock(b, bIdx, activeConfig))}
                  </div>
                </div>
              )}
            </div>
          ) : ("""

try:
    idx_start = content.index('{/* Right Live Preview Panel */}')
    idx_end = content.index(") : (\\n            <div style={{ textAlign: 'center'")
    
    new_content = content[:idx_start] + new_preview_logic.strip() + "\\n          ) : (" + content[idx_end + 5:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Dual panel patch applied!")
except Exception as e:
    print("Failed to replace:", e)
