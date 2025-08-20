import { storage } from '../appwrite'
import { ID } from 'appwrite'
import { STORAGE_ID } from '../appwrite'

export interface FileUpload {
  file: File
  onProgress?: (progress: number) => void
}

class StorageService {
  private bucketId = STORAGE_ID

  // Upload file
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const fileId = ID.unique()

      const response = await storage.createFile(
        this.bucketId,
        fileId,
        file,
        undefined,
        onProgress
      )

      return response.$id
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }

  // Get file URL
  getFileUrl(fileId: string): URL {
    return storage.getFileView(this.bucketId, fileId)
  }

  // Get file download URL
  getFileDownloadUrl(fileId: string): URL {
    return storage.getFileDownload(this.bucketId, fileId)
  }

  // Delete file
  async deleteFile(fileId: string): Promise<void> {
    try {
      await storage.deleteFile(this.bucketId, fileId)
    } catch (error) {
      console.error('File deletion error:', error)
      throw error
    }
  }
}

export const storageService = new StorageService()
