export async function compressImage(file: File, maxSizeMB = 1.5, maxWidth = 1024): Promise<{ base64: string, mimeType: string, previewUrl: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Invalid file type'))
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        let quality = 0.9
        let dataUrl = canvas.toDataURL('image/webp', quality)

        // Reduce quality if still too large
        while (dataUrl.length > maxSizeMB * 1024 * 1024 && quality > 0.1) {
          quality -= 0.1
          dataUrl = canvas.toDataURL('image/webp', quality)
        }

        const base64 = dataUrl.split(',')[1]
        resolve({ base64, mimeType: 'image/webp', previewUrl: dataUrl })
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}
