export interface ReflowedSection {
  type: 'VERSE' | 'CHORUS' | 'BRIDGE' | 'OTHER';
  label: string;
  slides: string[];
}

export function parseAndReflowRawLyrics(rawText: string, linesPerSlide = 4): ReflowedSection[] {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const sections: ReflowedSection[] = [];
  
  let currentLabel = 'Verse 1';
  let currentType: ReflowedSection['type'] = 'VERSE';
  let currentBuffer: string[] = [];
  let verseCounter = 1;

  const headerRegex = /^(\[?(Verse|Chorus|Bridge|Tag|Intro|Ending|Outro)\s*(\d+)?\]?)/i;

  const flushBuffer = () => {
    if (currentBuffer.length === 0) return;
    const slides: string[] = [];
    for (let i = 0; i < currentBuffer.length; i += linesPerSlide) {
      slides.push(currentBuffer.slice(i, i + linesPerSlide).join('\n'));
    }
    sections.push({ type: currentType, label: currentLabel, slides });
    currentBuffer = [];
  };

  for (const line of lines) {
    const match = line.match(headerRegex);
    if (match) {
      flushBuffer();
      const detectedType = match[2].toUpperCase();
      currentType = (['VERSE', 'CHORUS', 'BRIDGE'].includes(detectedType) ? detectedType : 'OTHER') as any;
      currentLabel = match[1].replace(/[\[\]]/g, '');
      if (currentType === 'VERSE' && !match[3]) {
        currentLabel = `Verse ${verseCounter++}`;
      }
    } else {
      currentBuffer.push(line);
    }
  }

  flushBuffer();
  return sections;
}
