/* eslint-disable prettier/prettier */
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import { Injectable, Logger } from '@nestjs/common';
import { FileServiceInterface } from './interfaces/fileservice.interface';

@Injectable()
export class FileServiceService implements FileServiceInterface{
  private readonly azureConnectionString = process.env.AZURE_BLOB_STORAGE;
  private readonly containerName = process.env.AZURE_CONTAINER_NAME;
  private readonly logger = new Logger(FileServiceService.name);

  private getBlobClient(filename: string): BlockBlobClient {
    this.logger.log('azureConnectionString =', this.azureConnectionString)
    this.logger.log('containerName =', this.containerName)

    const blobServiceClient = BlobServiceClient.fromConnectionString(this.azureConnectionString,);
    const containerClient = blobServiceClient.getContainerClient(this.containerName);
    const blobClient = containerClient.getBlockBlobClient(filename);
    return blobClient;
  } 

  public async uploadFile(filename: string, fileContent: Buffer): Promise<void> {
    const blobClient = this.getBlobClient(filename);
    await blobClient.uploadData(fileContent)
  }

  public async getFile(fileName: string) {
    this.logger.log('Filena name ', fileName);
    const blobClient = this.getBlobClient(fileName);
    const blobDownloaded = await blobClient.download();
    return blobDownloaded.readableStreamBody;
  }
}
