interface RemoteAiTabProps {
  remoteUrl: string
  isTranscribing: boolean
  transcriberStatus: string
  transcriberMsg: string
  transcriptLog: string[]
  onToggleTranscribe: () => void
}

export default function RemoteAiTab({
  remoteUrl,
  isTranscribing,
  transcriberStatus,
  transcriberMsg,
  transcriptLog,
  onToggleTranscribe
}: RemoteAiTabProps) {
  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-6 select-none bg-app-bg text-app-text">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Left Column: Wireless Remote Server */}
        <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-app-accent uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-app-accent" />
              Wireless LAN Web Remote Hub
            </h3>
            <p className="text-xs text-app-text-2 leading-relaxed">
              Connect smartphones or tablets on the same Wi-Fi network to control presentation slides wirelessly without installing apps.
            </p>

            <div className="bg-app-toolbar border border-app-border p-4 rounded-lg space-y-2">
              <span className="text-[10px] font-extrabold text-app-text-3 uppercase">Local Web Remote URL</span>
              <div className="font-mono text-sm text-app-accent font-bold select-all bg-app-panel p-2.5 rounded border border-app-border">
                {remoteUrl || 'Starting Web Remote Server...'}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-app-text-3 italic bg-app-toolbar p-3 rounded border border-app-border">
            Pro-Tip: Bookmark this address on your iPad or phone for instant wireless worship control.
          </div>
        </div>

        {/* Right Column: AI Local Speech Transcriber */}
        <div className="bg-app-panel border border-app-border p-5 rounded-xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-app-accent uppercase tracking-wider flex items-center justify-between">
              <span>HuggingFace Whisper AI Local Transcriber</span>
              <span className={`h-2 w-2 rounded-full ${isTranscribing ? 'bg-app-live animate-ping' : 'bg-app-text-3'}`} />
            </h3>

            <div className="bg-app-toolbar border border-app-border p-3 rounded-lg flex justify-between items-center text-xs">
              <div>
                <div className="text-app-text-2">Engine Status:</div>
                <div className="font-mono text-app-accent font-bold capitalize">{transcriberStatus}</div>
              </div>
              <button
                onClick={onToggleTranscribe}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition duration-150 cursor-pointer shadow-sm ${
                  isTranscribing
                    ? 'bg-app-live hover:opacity-90 text-white'
                    : 'bg-app-accent hover:opacity-90 text-white'
                }`}
              >
                {isTranscribing ? 'Stop Transcribing' : 'Start Speech Recognition'}
              </button>
            </div>

            {transcriberMsg && (
              <div className="text-[11px] font-mono text-app-text-2 bg-app-toolbar p-2.5 rounded border border-app-border">
                {transcriberMsg}
              </div>
            )}
          </div>

          {/* Transcript Log */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-app-text-3 uppercase">Live Speech Log</span>
            <div className="h-40 overflow-y-auto bg-app-toolbar border border-app-border p-3 rounded-lg space-y-1 font-mono text-xs text-app-text">
              {transcriptLog.length === 0 ? (
                <div className="text-app-text-3 italic">No speech detected yet...</div>
              ) : (
                transcriptLog.map((log, idx) => <div key={idx}>➔ {log}</div>)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
