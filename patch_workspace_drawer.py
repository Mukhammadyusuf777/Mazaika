import re

file_path = 'C:/Mazaika/mazaika-app/src/pages/ai/AiWorkspacePage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add getBotsByUser to imports
content = content.replace("import { createBot, saveSiteConfig } from '../../api/firestore'", 
                          "import { createBot, saveSiteConfig, getBotsByUser } from '../../api/firestore'")

# Add Menu icon to lucide-react imports
content = content.replace('ArrowLeft, Sparkles, Send, Bot, RefreshCw, Save, Globe',
                          'ArrowLeft, Sparkles, Send, Bot, RefreshCw, Save, Globe, Menu, X, MessageSquare')

# Inject new state and effect inside AiWorkspacePage
states_to_add = """
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const { switchProject } = useAICopilot()

  useEffect(() => {
    if (user) {
      getBotsByUser(user.id).then(setProjects)
    }
  }, [user])

  const handleSelectProject = (proj: any) => {
    // If it's an existing bot, we can load it to AI context
    // First, let's load the activeConfig
    const siteConfig = localStorage.getItem(`mazaika_site_${proj.id}`)
    let config = { ...proj, target_entity: 'bot' };
    if (siteConfig) {
       const parsedSite = JSON.parse(siteConfig);
       config = { ...config, ...parsedSite, target_entity: 'bot_and_mini_app' }
    }
    
    // Instead of doing complicated things, just switch the context:
    // If it was already saved in localStorage for AI config, it will load.
    // Or we just pass the default config we constructed.
    switchProject(proj.id, config)
    setDrawerOpen(false)
  }
"""

content = content.replace('const [savingBot, setSavingBot] = useState(false)', 
                          'const [savingBot, setSavingBot] = useState(false)\n' + states_to_add)

# Add the hamburger button
header_search = "<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>"
header_replace = """<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setDrawerOpen(true)} style={{ padding: '6px 8px' }}>
            <Menu size={20} />
          </button>"""

content = content.replace(header_search, header_replace)

# Add the Drawer UI right after <div className="ai-workspace-container">
drawer_ui = """
      {/* Projects Drawer */}
      {drawerOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: 300, height: '100vh', 
          background: '#090d16', borderRight: '1px solid rgba(255,255,255,0.1)', 
          zIndex: 9999, display: 'flex', flexDirection: 'column', 
          boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
          animation: 'slideInLeft 0.3s ease'
        }}>
          <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Mening Loyihalarim</h3>
            <button className="btn btn-ghost" style={{ padding: 4 }} onClick={() => setDrawerOpen(false)}><X size={20} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            <div 
              style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.05)', cursor: 'pointer', marginBottom: 8, border: '1px dashed rgba(255,255,255,0.2)' }}
              onClick={() => { switchProject('default', null); setDrawerOpen(false); }}
            >
              <div style={{ fontSize: 13, fontWeight: 700 }}>+ Yangi Loyiha</div>
            </div>
            {projects.map(p => (
              <div 
                key={p.id} 
                style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.02)', cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}
                onClick={() => handleSelectProject(p)}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={16} color="#10d974" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name || 'Loyiha'}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{new Date(p.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
"""

content = content.replace('<div className="ai-workspace-container">', '<div className="ai-workspace-container">\n' + drawer_ui)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("AiWorkspacePage Patched for Drawer!")
