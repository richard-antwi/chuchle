export interface CameraDevice {
  id: string
  label: string
}

export class CameraService {
  /**
   * Enumerates all connected video inputs (USB webcams, virtual cameras, capture cards)
   */
  public static async getCameras(): Promise<CameraDevice[]> {
    try {
      // Request initial permission to unlock device labels
      await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => {})

      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices
        .filter((device) => device.kind === 'videoinput')
        .map((device, index) => ({
          id: device.deviceId,
          label: device.label || `Video Input #${index + 1}`
        }))
    } catch (error) {
      console.error('Failed to list video inputs:', error)
      return []
    }
  }

  /**
   * Requests and returns the MediaStream for a specific camera device ID
   */
  public static async getCameraStream(deviceId: string): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = {
      video: deviceId
        ? { deviceId: { exact: deviceId } }
        : true,
      audio: false
    }
    return await navigator.mediaDevices.getUserMedia(constraints)
  }
}
