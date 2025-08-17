interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

interface UploadResult {
  success: boolean
  fileId?: string
  url?: string
  error?: string
}

class FileUploadManager {
  private maxFileSize = 100 * 1024 * 1024 // 100MB
  private allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "video/mp4",
    "video/webm",
    "audio/mpeg",
    "audio/wav",
  ]

  validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit`,
      }
    }

    if (!this.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "File type not supported",
      }
    }

    return { valid: true }
  }

  async uploadFile(file: File, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
    const validation = this.validateFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("fileName", file.name)
      formData.append("fileType", file.type)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()

      return {
        success: true,
        fileId: result.fileId,
        url: result.url,
      }
    } catch (error) {
      console.error("File upload error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      }
    }
  }

  async uploadMultipleFiles(
    files: File[],
    onProgress?: (fileIndex: number, progress: UploadProgress) => void,
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const result = await this.uploadFile(file, (progress) => {
        onProgress?.(i, progress)
      })
      results.push(result)
    }

    return results
  }

  generatePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      } else {
        // Generate generic preview based on file type
        const fileType = file.type.split("/")[0]
        resolve(`/placeholder.svg?height=120&width=160&text=${fileType.toUpperCase()}`)
      }
    })
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  getFileIcon(fileType: string): string {
    if (fileType.startsWith("image/")) return "🖼️"
    if (fileType.startsWith("video/")) return "🎥"
    if (fileType.startsWith("audio/")) return "🎵"
    if (fileType.includes("pdf")) return "📄"
    if (fileType.includes("word")) return "📝"
    if (fileType.includes("text")) return "📄"
    return "📁"
  }
}

export const fileUploadManager = new FileUploadManager()
export type { UploadProgress, UploadResult }
