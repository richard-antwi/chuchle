export interface ServiceQueueItem {
  id: string
  title: string
  sub: string
  type: 'scripture' | 'song' | 'pdf' | 'hymnal' | 'other'
  isCurrent?: boolean
  slides?: string[]
}

interface OrderOfServicePanelProps {
  queueItems: ServiceQueueItem[]
  currentQueueItemId: string
  onSelectQueueItem: (item: ServiceQueueItem) => void
}

export default function OrderOfServicePanel({
  queueItems,
  currentQueueItemId,
  onSelectQueueItem
}: OrderOfServicePanelProps) {
  return (
    <div className="mockup-panel mockup-service">
      <div className="panel-head">
        <h2>Order of service</h2>
        <span className="count">{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} — {queueItems.length} items</span>
      </div>

      <div className="service-list">
        {queueItems.map((item) => {
          const isCurrent = currentQueueItemId === item.id || item.isCurrent
          return (
            <div
              key={item.id}
              onClick={() => onSelectQueueItem(item)}
              className={`svc-item ${isCurrent ? 'current' : ''}`}
            >
              <div className="svc-icon">
                {item.type === 'scripture' && (
                  <svg viewBox="0 0 24 24">
                    <path d="M4 5c4 0 6 1 8 3 2-2 4-3 8-3v14c-4 0-6 1-8 3-2-2-4-3-8-3z" />
                  </svg>
                )}
                {item.type === 'song' && (
                  <svg viewBox="0 0 24 24">
                    <path d="M9 18V5l10-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="16" cy="16" r="3" />
                  </svg>
                )}
                {item.type === 'pdf' && (
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                  </svg>
                )}
                {item.type === 'hymnal' && (
                  <svg viewBox="0 0 24 24">
                    <path d="M9 18V5l10-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="16" cy="16" r="3" />
                  </svg>
                )}
                {item.type === 'other' && (
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 12h8M12 8v8" />
                  </svg>
                )}
              </div>
              <div>
                <div className="svc-title">{item.title}</div>
                <div className="svc-sub">{item.sub}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
