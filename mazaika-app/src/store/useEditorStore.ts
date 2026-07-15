import { create } from 'zustand'
import {
  type NodeChange,
  type EdgeChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react'
import { apiClient } from '../api/apiClient'

// We define our own Node/Edge interfaces to avoid import issues
export interface FlowNode {
  id: string
  type?: string
  position: { x: number; y: number }
  data: Record<string, any>
  selected?: boolean
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  type?: string
  animated?: boolean
  style?: Record<string, any>
}

export interface EditorState {
  nodes: FlowNode[]
  edges: FlowEdge[]
  isLoading: boolean
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  setNodes: (nodes: FlowNode[]) => void
  setEdges: (edges: FlowEdge[]) => void
  addNode: (node: FlowNode) => void
  deleteNode: (id: string) => void
  deleteEdge: (id: string) => void
  updateNodeData: (id: string, data: any) => void
  saveToStorage: (botId: string) => void
  loadFromStorage: (botId: string) => void
}

const INITIAL_NODES: FlowNode[] = [
  {
    id: '1',
    type: 'start',
    position: { x: 100, y: 150 },
    data: { label: 'Boshlash', emoji: '▶', color: '#10d974', text: 'Bot ishga tushganda ( /start )' }
  },
]

export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: INITIAL_NODES,
  edges: [],
  isLoading: false,
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes as any) as unknown as FlowNode[],
    })
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges as any) as unknown as FlowEdge[],
    })
  },
  onConnect: (connection) => {
    const newEdge = {
      ...connection,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 },
    } as any;
    set({
      edges: addEdge(newEdge, get().edges as any) as unknown as FlowEdge[],
    })
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => set({ nodes: [...get().nodes, node] }),
  deleteNode: (id) => set({
    nodes: get().nodes.filter(n => n.id !== id),
    edges: get().edges.filter(e => e.source !== id && e.target !== id)
  }),
  deleteEdge: (id) => set({
    edges: get().edges.filter(e => e.id !== id)
  }),
  updateNodeData: (id, data) => set({
    nodes: get().nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n)
  }),
  saveToStorage: async (botId: string) => {
    set({ isLoading: true })
    try {
      const data = { nodes: get().nodes, edges: get().edges }
      await apiClient.put(`/workflows/${botId}`, data)
    } catch (e) {
      console.error('Failed to save to server', e)
    } finally {
      set({ isLoading: false })
    }
  },
  loadFromStorage: async (botId: string) => {
    set({ isLoading: true })
    try {
      const res = await apiClient.get(`/workflows/${botId}`)
      if (res.data && res.data.nodes && res.data.edges) {
        set({ nodes: res.data.nodes, edges: res.data.edges })
      }
    } catch (e) {
      console.error('Failed to load editor state from server', e)
    } finally {
      set({ isLoading: false })
    }
  }
}))
