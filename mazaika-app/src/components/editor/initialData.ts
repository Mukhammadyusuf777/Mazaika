import type { Edge, Node } from '@xyflow/react'

export const INITIAL_NODES: Node[] = [
  {
    id: '1',
    type: 'start',
    position: { x: 100, y: 150 },
    data: { label: 'Boshlash', emoji: '▶', color: '#10d974', text: 'Bot ishga tushganda ( /start )' }
  },
  {
    id: '2',
    type: 'message',
    position: { x: 450, y: 120 },
    data: { 
      label: 'Xabar', 
      emoji: '💬', 
      color: '#1e90ff', 
      text: 'Assalomu alaykum! Mazaika do\'koniga xush kelibsiz.', 
      buttons: ['Katalog 🛍', 'Yordam ❓'] 
    }
  },
]

export const INITIAL_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true }
]
