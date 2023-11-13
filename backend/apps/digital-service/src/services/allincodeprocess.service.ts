/* eslint-disable prettier/prettier */
import { ProcessIncodeDto } from "@app/shared/contracts/incode.contract";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { IIncodeFilesService, IIncodeOcrService, IIncodeScoreService } from "../domain/interfaces";
import { IAllIncodeProcess } from "../domain/interfaces/IAllIncodeProcess.interface";

@Injectable()
export class AllIncodeProcess implements IAllIncodeProcess {
    private readonly logger = new Logger(AllIncodeProcess.name);
    constructor(
        @Inject('IIncodeFilesService')
        private readonly incodeFileServices: IIncodeFilesService,
        @Inject('IIncodeOcrService')
        private readonly ocrService: IIncodeOcrService,
        @Inject('IIncodeScoreService')
        private readonly scoreService: IIncodeScoreService
    ) {}


    incodeProcess = async (dto: ProcessIncodeDto): Promise<void> => {
        const score = await this.scoreService.getIncodeScore(dto);
        if(score){
            this.logger.log('SE PROCESO EL SCORE CORRECTAMENTE');
            const ocr = await this.ocrService.getIncodeOcrData(dto);
            if(ocr) {
                this.logger.log('SE PROCESO EL OCR CORRECTAMENTE');
                const files = await this.incodeFileServices.getIncodeFiles(dto);
                if(files){
                    this.logger.log(`SE PROCESARON LOS ARCHIVOS CORRECTAMENTE`)
                } else {
                    this.logger.error('NO FUE POSIBLE PROCESAR LOS ARCHIVOS')
                }
            } else {
                this.logger.error('NO FUE POSIBLE PROCESAR EL OCR')
            }
        }
        else{
            this.logger.error('NO FUE POSIBLE PROCESAR EL SCORE')
        }
    }
}