export async function loadKhmerFontFromUrl(url: string): Promise<string> {
  try {
    console.log(`Loading Khmer font from URL: ${url}`)
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to load font: ${response.statusText}`)
    }

    const fontBuffer = await response.arrayBuffer()
    const fontArray = new Uint8Array(fontBuffer)

    // Convert Uint8Array to base64 safely
    let binary = ''
    const chunkSize = 0x8000  // 32 KB chunks
    for (let i = 0; i < fontArray.length; i += chunkSize) {
      const chunk = fontArray.subarray(i, i + chunkSize)
      binary += String.fromCharCode(...chunk)
    }

    const base64Font = btoa(binary)

    console.log('Khmer font loaded and converted to base64 successfully.')
    return base64Font
  } catch (error) {
    console.error('Failed to load Khmer font from URL:', error)
    throw error
  }
}
