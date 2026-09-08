import { useCallback, useState, useEffect } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  BackgroundVariant, Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './EditorPage.css'

import { BlockSidebar } from '../../components/editor/BlockSidebar'
import { PropertiesPanel } from '../../components/editor/PropertiesPanel'
import { nodeTypes } from '../../components/editor/nodes'
import ButtonEdge from '../../components/editor/ButtonEdge'
import { useEditorStore, type FlowNode } from '../../store/useEditorStore'
import { Plus, Save, Sparkles, Smartphone } from 'lucide-react'
import { apiClient } from '../../api/apiClient'
import { useParams } from 'react-router-dom'
import { useChatStore } from '../../store/useChatStore'
import { saveSiteConfig, getSiteConfig } from '../../api/firestore'
import TokenInputModal from '../../components/modals/TokenInputModal'
import BotSimulatorModal from '../../components/modals/BotSimulatorModal'
import AIFlowGeneratorModal from '../../components/modals/AIFlowGeneratorModal'

const edgeTypes = {
  buttonEdge: ButtonEdge,
}

let nodeIdCounter = 10

export default function EditorPage() {
  const { botId } = useParams<{ botId: string }>()

  const {
    nodes, edges, isLoading,
    onNodesChange, onEdgesChange, onConnect,
    addNode, updateNodeData, deleteNode,
    saveToStorage, loadFromStorage, setNodes, setEdges
  } = useEditorStore()

  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [saved, setSaved] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showSimulatorModal, setShowSimulatorModal] = useState(false)
  const [showFlowGenModal, setShowFlowGenModal] = useState(false)

  const { activeConfig, setProjectId, setActiveConfig } = useChatStore()
  const switchProject = (id: string, config: any) => {
    setProjectId(id)
    if (config !== null) setActiveConfig(config)
  }

  // Sync AI-generated bot_blocks into the ReactFlow editor and custom Mini App code
  useEffect(() => {
    if (!activeConfig || !botId) return
    const aiNodes = activeConfig.bot_blocks
    const aiEdges = activeConfig.bot_edges
    if (Array.isArray(aiNodes) && aiNodes.length > 0) {
      // Validate that nodes have ReactFlow structure
      const hasPositions = aiNodes.every((n: any) => n.position && typeof n.position.x === 'number')
      if (hasPositions) {
        setNodes(aiNodes)
        setEdges(Array.isArray(aiEdges) ? aiEdges : [])
      }
    }
    
    // If AI generated frontend code for the bot's Mini App, save it
    if (activeConfig.html || (activeConfig.files && Object.keys(activeConfig.files).length > 0)) {
      getSiteConfig(botId).then(current => {
        saveSiteConfig(botId, {
          ...(current || {}),
          source_code: activeConfig.html || current?.source_code,
          files: activeConfig.files || current?.files
        }).catch(console.error)
      }).catch(console.error)
    }
  }, [activeConfig, botId])

  const checkStatus = useCallback(async () => {
    if (!botId) return
    try {
      const res = await apiClient.get(`/bots/${botId}`)
      setIsRunning(res.data?.isRunning || false)
    } catch (e) {
      console.error(e)
    }
  }, [botId])

  useEffect(() => {
    if (botId) {
      loadFromStorage(botId)
      checkStatus()
      // Switch AI project context to this bot
      switchProject(botId, null)
    }
  }, [botId, loadFromStorage, checkStatus])

  const startBot = async () => {
    if (!botId) return
    try {
      await handleSave()
      const res = await apiClient.post(`/bots/${botId}/start`)
      if (res.data?.error === 'Bot token is empty' || res.data?.error === 'Invalid token format') {
        setShowTokenModal(true)
        return
      } else if (res.data?.error) {
        setToastMessage(res.data.error)
        setTimeout(() => setToastMessage(null), 4000)
        return
      }
      setIsRunning(true)
      setToastMessage('✅ Бот успешно запущен и работает в Telegram!')
      setTimeout(() => setToastMessage(null), 3000)
    } catch (e: any) {
      if (e.response?.data?.error === 'Bot token is empty') {
        setShowTokenModal(true)
        return
      }
      setToastMessage('Ошибка при запуске бота. Проверьте токен!')
      setTimeout(() => setToastMessage(null), 4000)
    }
  }

  const handleTokenSubmit = async (token: string) => {
    if (!botId) return
    await apiClient.patch(`/bots/${botId}`, { token: token.trim() })
    const res = await apiClient.post(`/bots/${botId}/start`)
    if (res.data?.error) {
      throw new Error(res.data.error)
    }
    setIsRunning(true)
    setToastMessage('✅ Бот успешно активирован и запущен в Telegram!')
    setTimeout(() => setToastMessage(null), 3500)
  }

  const stopBot = async () => {
    if (!botId) return
    try {
      await apiClient.post(`/bots/${botId}/stop`)
      setIsRunning(false)
      setToastMessage('Бот остановлен')
      setTimeout(() => setToastMessage(null), 3000)
    } catch (e) {
      setToastMessage('Ошибка при остановке бота')
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  const handleSave = async () => {
    if (!botId) return
    await saveToStorage(botId)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedNode(node as FlowNode)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('nodeType')
      const label = event.dataTransfer.getData('nodeLabel')
      const color = event.dataTransfer.getData('nodeColor')
      const emoji = event.dataTransfer.getData('nodeEmoji')
      if (!type) return

      const reactFlowBounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
      const newNode: FlowNode = {
        id: `node-${++nodeIdCounter}`,
        type,
        position: {
          x: event.clientX - reactFlowBounds.left - 80,
          y: event.clientY - reactFlowBounds.top - 40
        },
        data: { label, color, emoji, text: '', buttons: [] },
      }
      addNode(newNode)
    },
    [addNode]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])



  return (
    <div className="editor-wrapper">
      <BlockSidebar open={sidebarOpen} searchQuery={searchQuery} onSearchChange={setSearchQuery} onClose={() => setSidebarOpen(false)} />

      <div className="editor-canvas" onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes as any}
          edges={edges as any}
          onNodesChange={onNodesChange as any}
          onEdgesChange={onEdgesChange as any}
          onConnect={onConnect as any}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          snapToGrid
          snapGrid={[16, 16]}
          defaultEdgeOptions={{
            type: 'buttonEdge',
            animated: true,
            style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="rgba(30, 144, 255, 0.15)" />
          <Controls className="flow-controls" showInteractive={false} />
          <MiniMap
            className="flow-minimap"
            nodeColor={(node) => (node.data as any).color || '#1e90ff'}
            maskColor="rgba(7, 9, 15, 0.85)"
          />

          <Panel position="top-right" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Plus size={14} /> Блоки
            </button>
            <button
              className="btn btn-sm"
              onClick={() => setShowFlowGenModal(true)}
              style={{
                background: 'linear-gradient(135deg, rgba(0,217,255,0.18) 0%, rgba(124,58,237,0.22) 100%)',
                border: '1px solid rgba(0,217,255,0.4)',
                color: '#00D9FF',
                fontWeight: 600
              }}
              title="Сгенерировать воронку бота с помощью ИИ за 2 секунды ($0.00)"
            >
              <Sparkles size={14} /> AI Воронка
            </button>
            <button
              className="btn btn-sm"
              onClick={() => setShowSimulatorModal(true)}
              style={{
                background: 'rgba(30,144,255,0.15)',
                border: '1px solid rgba(30,144,255,0.4)',
                color: '#60A5FA',
                fontWeight: 600
              }}
              title="Протестировать логику бота в интерактивном Telegram окне прямо в браузере (без токена, $0.00)"
            >
              <Smartphone size={14} /> Тестировать бота
            </button>
            <button
              className={`btn btn-sm ${saved ? 'btn-success' : 'btn-primary'}`}
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save size={14} /> {saved ? 'Сохранено! ✓' : 'Сохранить'}
            </button>
            {isRunning ? (
              <button className="btn btn-error btn-sm" onClick={stopBot} disabled={isLoading}>
                ⏹ Остановить бота
              </button>
            ) : (
              <button className="btn btn-success btn-sm" onClick={startBot} disabled={isLoading}>
                ▶ Запустить бота
              </button>
            )}
          </Panel>
        </ReactFlow>
      </div>

      {selectedNode && (() => {
        const currentNode = nodes.find(n => n.id === selectedNode.id)
        if (!currentNode) return null
        return (
          <PropertiesPanel
            node={currentNode as any}
            nodes={nodes as any[]}
            onClose={() => setSelectedNode(null)}
            onUpdate={(data) => updateNodeData(selectedNode.id, data)}
            onDelete={() => {
              deleteNode(selectedNode.id)
              setSelectedNode(null)
            }}
          />
        )
      })()}

      <TokenInputModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onSubmit={handleTokenSubmit}
        botName="Telegram Бот"
      />

      <BotSimulatorModal
        isOpen={showSimulatorModal}
        onClose={() => setShowSimulatorModal(false)}
        nodes={nodes}
        edges={edges}
        botName="Telegram Бот"
      />

      <AIFlowGeneratorModal
        isOpen={showFlowGenModal}
        onClose={() => setShowFlowGenModal(false)}
        onApplyFlow={(newNodes, newEdges) => {
          setNodes(newNodes)
          setEdges(newEdges)
          handleSave()
          setToastMessage('✨ Воронка бота успешно создана и добавлена на холст!')
          setTimeout(() => setToastMessage(null), 3500)
        }}
      />

      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 99999,
          background: 'rgba(11,15,25,0.95)',
          border: '1px solid rgba(0,217,255,0.3)',
          color: '#FFF',
          padding: '12px 20px',
          borderRadius: 16,
          boxShadow: '0 10px 35px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)',
          fontSize: 13,
          fontWeight: 600
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  )
}
