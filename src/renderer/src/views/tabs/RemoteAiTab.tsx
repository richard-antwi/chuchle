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
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-4 select-none text-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Left Column: Wireless Remote Server */}
        <div className="bg-[#141922] border border-[#232B38] p-5 rounded-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-[#3FA9F5] uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#3FA9F5]" />
              Wireless LAN Web Remote Hub
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connect smartphones or tablets on the same Wi-Fi network to control presentation slides wirelessly without installing apps.
            </p>

            <div className="bg-[#0B0E14] border border-[#232B38] p-4 rounded-lg space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Local Web Remote URL</span>
              <div className="font-mono text-sm text-[#3FA9F5] font-bold select-all bg-[#141922] p-2.5 rounded border border-[#232B38]">
                {remoteUrl || 'Starting Web Remote Server...'}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 italic bg-[#0B0E14] p-3 rounded border border-[#232B38]">
            Pro-Tip: Bookmark this address on your iPad or phone for instant wireless worship control.
          </div>
        </div>

        {/* Right Column: AI Local Speech Transcriber */}
        <div className="bg-[#141922] border border-[#232B38] p-5 rounded-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-[#F5A623] uppercase tracking-wider flex items-center justify-between">
              <span>HuggingFace Whisper AI Local Transcriber</span>
              <span className={`h-2 w-2 rounded-full ${isTranscribing ? 'bg-[#F5A623] animate-ping' : 'bg-slate-600'}`} />
            </h3>

            <div className="bg-[#0B0E14] border border-[#232B38] p-3 rounded-lg flex justify-between items-center text-xs">
              <div>
                <div className="text-slate-400">Engine Status:</div>
                <div className="font-mono text-[#F5A623] font-bold capitalize">{transcriberStatus}</div>
              </div>
              <button
                onClick={onToggleTranscribe}
                className={`px-4 py-2 rounded text-xs font-extrabold uppercase tracking-wider transition cursor-pointer ${
                  isTranscribing ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-[#F5A623] hover:bg-[#d98f19] text-slate-950'
                }`}
              >
                {isTranscribing ? 'Stop Transcribing' : 'Start Speech Recognition'}
              </button>
            </div>

            {transcriberMsg && (
              <div className="text-[11px] font-mono text-slate-400 bg-[#0B0E14] p-2.5 rounded border border-[#232B38]">
                {transcriberMsg}
              </div>
            )}
          </div>

          {/* Transcript Log */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase">Live Speech Log</span>
            <div className="h-40 overflow-y-auto bg-[#0B0E14] border border-[#232B38] p-3 rounded-lg space-y-1 font-mono text-xs text-slate-300">
              {transcriptLog.length === 0 ? (
                <div className="text-slate-600 italic">No speech detected yet...</div>
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
