import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface S3FileMetadata {
  bucket: string;
  key: string;
  url: string;
  size: number;
  lastModified: Date;
  contentType: string;
  etag: string;
}

export interface S3UploadOptions {
  organization: 'general' | 'region5' | 'wl4wj';
  category: string;
  tags: string[];
  uploadedBy: string;
}

class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || 'chwone-files';

    this.s3Client = new S3Client({
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  /**
   * Generate a unique key for the file based on organization and metadata
   */
  private generateFileKey(
    fileName: string,
    organization: string,
    uploadedBy: string,
    timestamp: number = Date.now()
  ): string {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${organization}/${uploadedBy}/${timestamp}_${sanitizedFileName}`;
  }

  /**
   * Upload a file to S3 with organization-based folder structure
   */
  async uploadFile(
    file: File,
    options: S3UploadOptions
  ): Promise<{ key: string; url: string; metadata: S3FileMetadata }> {
    const fileKey = this.generateFileKey(
      file.name,
      options.organization,
      options.uploadedBy
    );

    const uploadParams = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file,
      ContentType: file.type || 'application/octet-stream',
      Metadata: {
        originalName: file.name,
        organization: options.organization,
        category: options.category,
        tags: options.tags.join(','),
        uploadedBy: options.uploadedBy,
        uploadedAt: new Date().toISOString(),
      },
    };

    try {
      const parallelUploads3 = new Upload({
        client: this.s3Client,
        params: uploadParams,
        partSize: 1024 * 1024 * 5, // 5MB chunks
        leavePartsOnError: false,
      });

      const result = await parallelUploads3.done();

      // Generate a signed URL for immediate access
      const signedUrl = await this.generateSignedUrl(fileKey, 'GET', 3600); // 1 hour

      const metadata: S3FileMetadata = {
        bucket: this.bucketName,
        key: fileKey,
        url: signedUrl,
        size: file.size,
        lastModified: new Date(),
        contentType: file.type || 'application/octet-stream',
        etag: result.ETag || '',
      };

      return {
        key: fileKey,
        url: signedUrl,
        metadata,
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a signed URL for secure file access
   */
  async generateSignedUrl(
    key: string,
    operation: 'GET' | 'PUT' | 'DELETE' = 'GET',
    expiresIn: number = 3600
  ): Promise<string> {
    const command = operation === 'GET'
      ? new GetObjectCommand({ Bucket: this.bucketName, Key: key })
      : operation === 'PUT'
      ? new PutObjectCommand({ Bucket: this.bucketName, Key: key })
      : new DeleteObjectCommand({ Bucket: this.bucketName, Key: key });

    try {
      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate secure file URL');
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file metadata from S3
   */
  async getFileMetadata(key: string): Promise<S3FileMetadata> {
    try {
      const response = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );

      return {
        bucket: this.bucketName,
        key,
        url: await this.generateSignedUrl(key, 'GET', 3600),
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        contentType: response.ContentType || 'application/octet-stream',
        etag: response.ETag || '',
      };
    } catch (error) {
      console.error('Error getting file metadata from S3:', error);
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List files in an organization folder
   */
  async listFiles(
    organization: string,
    prefix?: string,
    maxKeys: number = 100
  ): Promise<S3FileMetadata[]> {
    try {
      const listParams = {
        Bucket: this.bucketName,
        Prefix: prefix || `${organization}/`,
        MaxKeys: maxKeys,
      };

      const response = await this.s3Client.send(new ListObjectsV2Command(listParams));

      if (!response.Contents) {
        return [];
      }

      const files: S3FileMetadata[] = [];

      for (const object of response.Contents) {
        if (object.Key && object.Size && object.Size > 0) {
          try {
            const metadata = await this.getFileMetadata(object.Key);
            files.push(metadata);
          } catch (error) {
            console.warn(`Failed to get metadata for ${object.Key}:`, error);
          }
        }
      }

      return files;
    } catch (error) {
      console.error('Error listing files from S3:', error);
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get files by organization
   */
  async getFilesByOrganization(
    organization: 'general' | 'region5' | 'wl4wj'
  ): Promise<S3FileMetadata[]> {
    return this.listFiles(organization);
  }

  /**
   * Get files by category within an organization
   */
  async getFilesByCategory(
    organization: 'general' | 'region5' | 'wl4wj',
    category: string
  ): Promise<S3FileMetadata[]> {
    // This would require storing category in metadata or using a database lookup
    // For now, we'll list all files and filter by metadata
    const allFiles = await this.listFiles(organization);
    return allFiles.filter(file => {
      // We'd need to store category in S3 metadata or use a separate lookup
      return true; // Placeholder - would filter based on stored metadata
    });
  }

  /**
   * Check if a file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get bucket information
   */
  getBucketInfo(): { name: string; region: string } {
    return {
      name: this.bucketName,
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    };
  }

  /**
   * Generate a public URL for a file (if bucket allows public access)
   */
  generatePublicUrl(key: string): string {
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
  }
}

export const s3Service = new S3Service();
