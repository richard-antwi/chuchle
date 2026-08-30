import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist'

// Use CDN worker endpoint for zero-dependency portability
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`

export interface ExtractedSlide {
  slideNumber: number
  imageUrl: string
}

export class SlideImporterClass {
  public async extractSlidesFromPdf(file: File): Promise<ExtractedSlide[]> {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    const numPages = pdf.numPages
    const extracted: ExtractedSlide[] = []

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 1.5 })

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) continue

      canvas.width = viewport.width
      canvas.height = viewport.height

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      } as any

      await page.render(renderContext).promise
      const imageUrl = canvas.toDataURL('image/png')
      extracted.push({
        slideNumber: pageNum,
        imageUrl
      })
    }

    return extracted
  }
}

export const SlideImporter = new SlideImporterClass()
export default SlideImporter
