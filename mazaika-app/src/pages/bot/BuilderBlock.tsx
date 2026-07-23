export interface BuilderBlockProps {
  block: any
  config: any
  isActive: boolean
  onClick: () => void
  onUpdateBlock: (updatedBlock: any) => void
  viewMode?: 'desktop' | 'mobile'
}

export default function BuilderBlock({ block }: BuilderBlockProps) {
  return (
    <div style={{ padding: 16, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>
      <p style={{ margin: 0, fontSize: 12 }}>{block?.type || 'Block'}</p>
    </div>
  )
}
