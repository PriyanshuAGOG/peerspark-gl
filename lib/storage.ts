import { Client, Storage, ID } from 'appwrite'
import { BUCKETS } from './appwrite'

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

export const storage = new Storage(client)

export interface FileUpload {
  file: File
  onProgress?: (progress: number) => void
}

export class StorageService {
  // Core methods that require a bucketId
  async uploadFile(
    bucketId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const fileId = ID.unique()
      const response = await storage.createFile(
        bucketId,
        fileId,
        file,
        undefined,
        onProgress
      )
      return response.$id
    } catch (error) {
      console.error(`File upload error in bucket ${bucketId}:`, error)
      throw error
    }
  }

  getFileUrl(bucketId: string, fileId: string): string {
    return storage.getFileView(bucketId, fileId).href
  }

  getFileDownloadUrl(bucketId: string, fileId: string): string {
    return storage.getFileDownload(bucketId, fileId).href
  }

  getFilePreviewUrl(
    bucketId: string,
    fileId: string,
    width?: number,
    height?: number,
    quality?: number
  ): string {
    return storage.getFilePreview(
      bucketId,
      fileId,
      width,
      height,
      'center',
      quality || 80
    ).href
  }

  async deleteFile(bucketId: string, fileId: string): Promise<void> {
    try {
      await storage.deleteFile(bucketId, fileId)
    } catch (error) {
      console.error(`File deletion error in bucket ${bucketId}:`, error)
      throw error
    }
  }

  // Convenience wrappers for specific buckets
  async uploadAvatar(file: File): Promise<string> {
    if (!this.validateFileType(file, ['jpg', 'jpeg', 'png', 'webp'])) {
      throw new Error('Invalid file type for avatar')
    }
    if (!this.validateFileSize(file, 5)) {
      throw new Error('Avatar file size must be less than 5MB')
    }
    return await this.uploadFile(BUCKETS.AVATARS, file)
  }

  async uploadPostImage(file: File): Promise<string> {
    if (!this.validateFileType(file, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
      throw new Error('Invalid file type for post image')
    }
    if (!this.validateFileSize(file, 10)) {
      throw new Error('Post image file size must be less than 10MB')
    }
    return await this.uploadFile(BUCKETS.POST_IMAGES, file)
  }

  async uploadChatAttachment(file: File): Promise<{fileId: string, fileUrl: string, fileName: string, fileSize: number}> {
    if (!this.validateFileSize(file, 25)) {
        throw new Error('Attachment file size must be less than 25MB');
    }
    const fileId = await this.uploadFile(BUCKETS.ATTACHMENTS, file);
    const fileUrl = this.getFileUrl(BUCKETS.ATTACHMENTS, fileId);
    return { fileId, fileUrl, fileName: file.name, fileSize: file.size };
  }

  async uploadResource(file: File): Promise<string> {
    if (!this.validateFileSize(file, 50)) {
        throw new Error('Resource file size must be less than 50MB');
    }
    return await this.uploadFile(BUCKETS.RESOURCES, file);
  }


  // Validation helpers
  validateFileType(file: File, allowedTypes: string[]): boolean {
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    return allowedTypes.includes(fileExtension || '')
  }

  validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    return file.size <= maxSizeInBytes
  }
}

export const storageService = new StorageService()
