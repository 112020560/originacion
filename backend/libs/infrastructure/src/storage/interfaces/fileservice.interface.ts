/* eslint-disable prettier/prettier */
export interface FileServiceInterface {
    uploadFile(filename: string, fileContent: Buffer): Promise<void>;
    getFile(fileName: string) ;
}