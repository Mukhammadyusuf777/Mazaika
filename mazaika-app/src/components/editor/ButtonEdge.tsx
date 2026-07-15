import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react'
import { useEditorStore } from '../../store/useEditorStore'

export default function ButtonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  })

  const deleteEdge = useEditorStore((state) => state.deleteEdge)

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation()
    deleteEdge(id)
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            onClick={onEdgeClick}
            style={{
              width: '20px',
              height: '20px',
              background: '#ef4444',
              border: 'none',
              borderRadius: '50%',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            ✕
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
