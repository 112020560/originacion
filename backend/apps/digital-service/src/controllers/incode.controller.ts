/* eslint-disable prettier/prettier */
import { EXECUTE_ALL_EVENTS, INCODE_GET_FILES, INCODE_GET_OCR_DATA, INCODE_GET_SCORE_DATA } from "@app/shared/Const/events.const";
import { ProcessIncodeDto } from "@app/shared/contracts/incode.contract";
import { Controller, Inject, Logger } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { IIncodeFilesService, IIncodeOcrService, IIncodeScoreService, IAllIncodeProcess } from "../domain/interfaces";

@Controller()
export class IncodeController {
    private readonly logger = new Logger(IncodeController.name);
    constructor(
        @Inject('IIncodeOcrService')
        private readonly ocrService: IIncodeOcrService,
        @Inject('IIncodeScoreService')
        private readonly scoreService: IIncodeScoreService,
        @Inject('IIncodeFilesService')
        private readonly fileService: IIncodeFilesService,
        @Inject('IAllIncodeProcess')
        private readonly allEventsService: IAllIncodeProcess
    ) { }

    @EventPattern(INCODE_GET_OCR_DATA)
    async getOcrData(@Payload() data: ProcessIncodeDto) {
        this.logger.log(`Recived data [ CMD: ${INCODE_GET_OCR_DATA}, PAYLOAD: ${JSON.stringify(data)} ]`);
        await this.ocrService.getIncodeOcrData(data);
    }

    @EventPattern(INCODE_GET_SCORE_DATA)
    async getScoreData(@Payload() data: ProcessIncodeDto) {
        this.logger.log(`Recived data [ CMD: ${INCODE_GET_SCORE_DATA}, PAYLOAD: ${JSON.stringify(data)} ]`);
        await this.scoreService.getIncodeScore(data);
    }

    @EventPattern(INCODE_GET_FILES)
    async getFiles(@Payload() data: ProcessIncodeDto) {
        this.logger.log(`Recived data [ CMD: ${INCODE_GET_FILES}, PAYLOAD: ${JSON.stringify(data)} ]`);
        await this.fileService.getIncodeFiles(data);
    }

    @EventPattern(EXECUTE_ALL_EVENTS)
    async executeAllEvent(@Payload() data: ProcessIncodeDto) {
        this.logger.log(`Recived data [ CMD: ${EXECUTE_ALL_EVENTS}, PAYLOAD: ${JSON.stringify(data)} ]`);
        await this.allEventsService.incodeProcess(data);
    }
}