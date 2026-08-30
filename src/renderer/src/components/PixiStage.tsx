import { useEffect, useRef } from 'react'
import { Application, Container, Text, TextStyle, Graphics, Texture, Sprite, ColorMatrixFilter } from 'pixi.js'
import { useDisplayStore } from '../stores/useDisplayStore'
import { CameraService } from '../services/CameraService'
import { createChromaKeyFilter } from './filters/ChromaKeyFilter'

function hexToRgb(hex: string): number[] {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255
  return [r, g, b]
}

export default function PixiStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<Application | null>(null)
  const textContainerRef = useRef<Container | null>(null)
  const bgGraphicsRef = useRef<Graphics | null>(null)
  const cameraContainerRef = useRef<Container | null>(null)
  const bgSpriteRef = useRef<Sprite | null>(null)

  const activeStreamRef = useRef<MediaStream | null>(null)
  const videoElementRef = useRef<HTMLVideoElement | null>(null)
  const cameraSpriteRef = useRef<Sprite | null>(null)

  const colorMatrixRef = useRef<ColorMatrixFilter | null>(null)
  const chromaKeyFilterRef = useRef<any | null>(null)

  const lyrics = useDisplayStore((state) => state.currentLyrics)
  const background = useDisplayStore((state) => state.activeBackground)
  const theme = useDisplayStore((state) => state.activeTheme)
  const activeCameraDeviceId = useDisplayStore((state) => state.activeCameraDeviceId)
  const colorGrading = useDisplayStore((state) => state.colorGrading)
  const chromaKeyConfig = useDisplayStore((state) => state.chromaKey)

  useEffect(() => {
    if (!canvasRef.current) return

    let active = true
    let app: Application | null = null

    const initPixi = async () => {
      app = new Application()
      await app.init({
        canvas: canvasRef.current!,
        resizeTo: window,
        antialias: true,
        backgroundAlpha: 0
      })

      if (!active) {
        app.destroy(true, { children: true })
        return
      }

      appRef.current = app

      const bgGraphics = new Graphics()
      app.stage.addChild(bgGraphics)
      bgGraphicsRef.current = bgGraphics

      const cameraContainer = new Container()
      app.stage.addChild(cameraContainer)
      cameraContainerRef.current = cameraContainer

      const textContainer = new Container()
      app.stage.addChild(textContainer)
      textContainerRef.current = textContainer

      colorMatrixRef.current = new ColorMatrixFilter()
      chromaKeyFilterRef.current = createChromaKeyFilter()

      renderScene()
    }

    initPixi()

    return () => {
      active = false
      cleanupCameraStream()
      if (app) {
        app.destroy(true, { children: true })
      }
      appRef.current = null
      textContainerRef.current = null
      bgGraphicsRef.current = null
      bgSpriteRef.current = null
      cameraContainerRef.current = null
      cameraSpriteRef.current = null
      colorMatrixRef.current = null
      chromaKeyFilterRef.current = null
    }
  }, [])

  useEffect(() => {
    const updateCameraStream = async () => {
      cleanupCameraStream()

      if (!activeCameraDeviceId || !cameraContainerRef.current || !appRef.current) return

      try {
        const stream = await CameraService.getCameraStream(activeCameraDeviceId)
        activeStreamRef.current = stream

        const video = document.createElement('video')
        video.autoplay = true
        video.playsInline = true
        video.muted = true
        video.srcObject = stream

        video.onloadedmetadata = () => {
          if (!appRef.current || !cameraContainerRef.current) return
          video.play()

          videoElementRef.current = video

          const texture = Texture.from(video)
          const cameraSprite = new Sprite(texture)

          const { width, height } = appRef.current.screen
          cameraSprite.width = width
          cameraSprite.height = height

          cameraContainerRef.current.addChild(cameraSprite)
          cameraSpriteRef.current = cameraSprite

          applyFilters()
        }
      } catch (error) {
        console.error('Failed to initialize webcam texture:', error)
      }
    }

    updateCameraStream()
  }, [activeCameraDeviceId])

  useEffect(() => {
    renderScene()
    applyFilters()
  }, [lyrics, background, theme, colorGrading, chromaKeyConfig])

  const cleanupCameraStream = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop())
      activeStreamRef.current = null
    }
    if (videoElementRef.current) {
      videoElementRef.current.pause()
      videoElementRef.current.srcObject = null
      videoElementRef.current = null
    }
    if (cameraSpriteRef.current && cameraContainerRef.current) {
      cameraContainerRef.current.removeChild(cameraSpriteRef.current)
      cameraSpriteRef.current.destroy({ children: true, texture: true })
      cameraSpriteRef.current = null
    }
  }

  const applyFilters = () => {
    const cameraSprite = cameraSpriteRef.current
    const colorMatrix = colorMatrixRef.current
    const chromaKey = chromaKeyFilterRef.current

    if (!cameraSprite || !colorMatrix || !chromaKey) return

    colorMatrix.reset()
    colorMatrix.brightness(colorGrading.brightness, false)
    colorMatrix.contrast(colorGrading.contrast, false)
    colorMatrix.saturate(colorGrading.saturation, false)

    const activeFilters: any[] = [colorMatrix]

    if (chromaKeyConfig.enabled) {
      const rgb = hexToRgb(chromaKeyConfig.color)
      chromaKey.resources.chromaUniforms.uniforms.uKeyColor.value = new Float32Array(rgb)
      chromaKey.resources.chromaUniforms.uniforms.uSimilarity.value = chromaKeyConfig.similarity
      chromaKey.resources.chromaUniforms.uniforms.uSmoothness.value = chromaKeyConfig.smoothness
      activeFilters.push(chromaKey)
    }

    cameraSprite.filters = activeFilters
  }

  const renderScene = () => {
    const app = appRef.current
    const bgGraphics = bgGraphicsRef.current
    const textContainer = textContainerRef.current
    const cameraSprite = cameraSpriteRef.current

    if (!app || !bgGraphics || !textContainer) return

    const { width, height } = app.screen

    if (cameraSprite) {
      cameraSprite.width = width
      cameraSprite.height = height
    }

    bgGraphics.clear()
    let bgSprite = bgSpriteRef.current
    if (background.type === 'image') {
      if (!bgSprite) {
        bgSprite = new Sprite()
        app.stage.addChildAt(bgSprite, 0)
        bgSpriteRef.current = bgSprite
      }
      bgSprite.texture = Texture.from(background.value)
      bgSprite.width = width
      bgSprite.height = height
      bgSprite.visible = true
    } else {
      if (bgSprite) {
        bgSprite.visible = false
      }
      if (background.type === 'color') {
        bgGraphics.rect(0, 0, width, height)
        bgGraphics.fill({ color: background.value })
      }
    }

    while (textContainer.children.length > 0) {
      textContainer.removeChildAt(0).destroy({ children: true })
    }

    const style = new TextStyle({
      fontFamily: theme.fontFamily || 'Arial',
      fontSize: theme.fontSize || 48,
      fill: theme.textColor || '#ffffff',
      align: 'center',
      wordWrap: true,
      wordWrapWidth: width * 0.8,
      dropShadow: {
        color: '#000000',
        alpha: 0.8,
        blur: 8,
        distance: 4,
        angle: Math.PI / 4
      }
    })

    const fullText = lyrics.join('\n')
    const pixiText = new Text({
      text: fullText,
      style
    })

    pixiText.anchor.set(0.5)
    pixiText.x = width / 2
    pixiText.y = height / 2

    textContainer.addChild(pixiText)
  }

  return <canvas ref={canvasRef} className="h-full w-full block" />
}
