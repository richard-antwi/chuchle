import OBSWebSocket from 'obs-websocket-js'

export class ObsControllerServiceClass {
  private obs = new OBSWebSocket()
  private isConnected = false
  private scenes: string[] = []
  private statusCallback: ((connected: boolean, message?: string) => void) | null = null

  // Maps slide categories to OBS Scene names
  private mappings: Record<string, string> = {
    VERSE: '',
    CHORUS: '',
    BRIDGE: '',
    BIBLE: '',
    VIDEO: '',
    OTHER: ''
  }

  public getConnected(): boolean {
    return this.isConnected
  }

  public getScenes(): string[] {
    return this.scenes
  }

  public setMappings(newMappings: Record<string, string>) {
    this.mappings = { ...this.mappings, ...newMappings }
  }

  public getMappings(): Record<string, string> {
    return this.mappings
  }

  public async connect(
    host = '127.0.0.1',
    port = 4455,
    password = '',
    onStatusChange?: (connected: boolean, message?: string) => void
  ): Promise<boolean> {
    if (onStatusChange) {
      this.statusCallback = onStatusChange
    }

    try {
      this.statusCallback?.(false, 'Connecting to OBS WebSocket...')
      await this.obs.connect(`ws://${host}:${port}`, password)
      this.isConnected = true

      const response = await this.obs.call('GetSceneList')
      this.scenes = (response.scenes || []).map((s: any) => s.sceneName)

      this.statusCallback?.(true, 'Connected to OBS Studio!')
      return true
    } catch (err: any) {
      console.error('Failed to connect to OBS Studio WebSocket:', err)
      this.isConnected = false
      this.statusCallback?.(false, err.message || 'Connection failed.')
      return false
    }
  }

  public async disconnect() {
    if (this.isConnected) {
      try {
        await this.obs.disconnect()
      } catch (e) {}
      this.isConnected = false
      this.scenes = []
      this.statusCallback?.(false, 'Disconnected.')
    }
  }

  public async switchScene(sceneName: string): Promise<boolean> {
    if (!this.isConnected) return false
    try {
      if (!this.scenes.includes(sceneName)) return false
      await this.obs.call('SetCurrentProgramScene', { sceneName })
      return true
    } catch (err) {
      console.error(`Failed to switch OBS scene to "${sceneName}":`, err)
      return false
    }
  }

  /**
   * Automatically switches scenes in OBS based on active slide properties
   */
  public handleSlideTransition(label: string, lyricsText: string, hasVideoBackground: boolean) {
    if (!this.isConnected) return

    let targetCategory = 'OTHER'

    const cleanLabel = label.toUpperCase()
    if (hasVideoBackground) {
      targetCategory = 'VIDEO'
    } else if (cleanLabel.includes('VERSE')) {
      targetCategory = 'VERSE'
    } else if (cleanLabel.includes('CHORUS')) {
      targetCategory = 'CHORUS'
    } else if (cleanLabel.includes('BRIDGE')) {
      targetCategory = 'BRIDGE'
    } else if (
      cleanLabel.includes('BIBLE') ||
      /^(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1\s?Samuel|2\s?Samuel|1\s?Kings|2\s?Kings|1\s?Chronicles|2\s?Chronicles|Ezra|Nehemiah|Esther|Job|Psalms|Proverbs|Ecclesiastes|Song|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1\s?Corinthians|2\s?Corinthians|Galatians|Ephesians|Philippians|Colossians|1\s?Thessalonians|2\s?Thessalonians|1\s?Timothy|2\s?Timothy|Titus|Philemon|Hebrews|James|1\s?Peter|2\s?Peter|1\s?John|2\s?John|3\s?John|Jude|Revelation)\s+\d+:\d+/i.test(lyricsText.trim())
    ) {
      targetCategory = 'BIBLE'
    }

    const sceneName = this.mappings[targetCategory]
    if (sceneName) {
      this.switchScene(sceneName)
    }
  }
}

export const ObsControllerService = new ObsControllerServiceClass()
export default ObsControllerService
