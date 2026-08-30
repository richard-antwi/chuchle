import axios from 'axios'

export interface VlcStatus {
  state: 'playing' | 'paused' | 'stopped'
  time: number
  length: number
  volume: number
  fullscreen: boolean
  filename: string
}

export class VlcMediaService {
  private baseUrl: string
  private authHeader: string

  constructor(host = '127.0.0.1', port = 8080, password = 'churchpassword') {
    this.baseUrl = `http://${host}:${port}/requests/status.json`
    this.authHeader = `Basic ${Buffer.from(`:${password}`).toString('base64')}`
  }

  public async sendCommand(
    command: string,
    extraParams: Record<string, string | number> = {}
  ): Promise<VlcStatus | null> {
    try {
      const response = await axios.get(this.baseUrl, {
        headers: { Authorization: this.authHeader },
        params: { command, ...extraParams },
        timeout: 1500
      })
      return {
        state: response.data.state || 'stopped',
        time: response.data.time || 0,
        length: response.data.length || 0,
        volume: response.data.volume || 0,
        fullscreen: Boolean(response.data.fullscreen),
        filename: response.data.information?.category?.meta?.filename || 'External VLC Media'
      }
    } catch (error) {
      return null
    }
  }

  public play() {
    return this.sendCommand('pl_play')
  }
  public pause() {
    return this.sendCommand('pl_pause')
  }
  public stop() {
    return this.sendCommand('pl_stop')
  }
  public seek(seconds: number) {
    return this.sendCommand('seek', { val: seconds })
  }
  public setVolume(vol0to256: number) {
    return this.sendCommand('volume', { val: Math.round(vol0to256) })
  }
}
