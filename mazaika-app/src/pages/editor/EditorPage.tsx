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
import { Plus, Save } from 'lucide-react'
import { apiClient } from '../../api/apiClient'
import { useParams } from 'react-router-dom'
import { useAICopilot } from '../../context/AICopilotContext'

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

  const { activeConfig, switchProject } = useAICopilot()

  // Sync AI-generated bot_blocks into the ReactFlow editor
  useEffect(() => {
    if (!activeConfig) return
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
  }, [activeConfig])

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
      
      // We first check if the bot has a valid token by fetching it, or we rely on the backend's error message.
      // But it's easier to just call start, and if it fails due to token, prompt.
      let res = await apiClient.post(`/bots/${botId}/start`)
      
      if (res.data?.error === 'Bot token is empty' || res.data?.error === 'Invalid token format') {
        const token = prompt("Bot hali ishga tushmadi! Iltimos, BotFather'dan olingan haqiqiy Telegram Bot Tokenni kiriting:");
        if (token && token.trim() !== '' && token.trim() !== 'TEST_TOKEN') {
          await apiClient.patch(`/bots/${botId}`, { token: token.trim() })
          res = await apiClient.post(`/bots/${botId}/start`)
          if (res.data?.error) {
             alert(res.data.error)
             return
          }
        } else {
          return
        }
      } else if (res.data?.error) {
        alert(res.data.error)
        return
      }
      
      setIsRunning(true)
    } catch (e: any) {
      if (e.response?.data?.error === 'Bot token is empty') {
        const token = prompt("Bot hali ishga tushmadi! Iltimos, BotFather'dan olingan haqiqiy Telegram Bot Tokenni kiriting:");
        if (token && token.trim() !== '' && token.trim() !== 'TEST_TOKEN') {
          await apiClient.patch(`/bots/${botId}`, { token: token.trim() })
          try {
            await apiClient.post(`/bots/${botId}/start`)
            setIsRunning(true)
          } catch (err) {
            alert("Token xato yoki bot ishga tushmadi!")
          }
        }
        return;
      }
      alert("Botni ishga tushirishda xatolik!")
    }
  }

  const stopBot = async () => {
    if (!botId) return
    try {
      await apiClient.post(`/bots/${botId}/stop`)
      setIsRunning(false)
    } catch (e) {
      alert("Botni to'xtatishda xatolik!")
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
              <Plus size={14} /> Bloklar
            </button>
            <button
              className={`btn btn-sm ${saved ? 'btn-success' : 'btn-primary'}`}
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save size={14} /> {saved ? 'Saqlandi! ✓' : 'Saqlash'}
            </button>
            {isRunning ? (
              <button className="btn btn-error btn-sm" onClick={stopBot} disabled={isLoading}>
                To'xtatish
              </button>
            ) : (
              <button className="btn btn-success btn-sm" onClick={startBot} disabled={isLoading}>
                ▶ Ishga tushirish
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
    </div>
  )
}
