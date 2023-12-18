/* eslint-disable prettier/prettier */
import { IncodeScoreResponse } from "@app/infrastructure/api/incode/models/processgovernmentresponse";
import { FolioInterfaceRepository } from "@app/infrastructure/mongodb/interfaces/folio.interface";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { IScoreService } from "../domain/interfaces/score.interface";
import { ScoreDigitalRespModel, ScoreResponse } from "../domain/models";

@Injectable()
export class ScoreService implements IScoreService {
    private readonly logger = new Logger(ScoreService.name);
    constructor(
        @Inject('FolioInterfaceRepository')
        readonly folioRepository: FolioInterfaceRepository,
    ) { }

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    public getScore = async (id_solicitud: number, forzar: boolean = false): Promise<ScoreDigitalRespModel> => {
        try {
            const folio = await this.folioRepository.findOneByFilter({ id_request: id_solicitud });
            if (folio) {
                const info = folio.kyc.informacionPersonal;
                const fullname =  `${info.Nombre} ${info.SegundoNombre} ${info.ApellidoPaterno} ${info.ApellidoMaterno}`
                const digital = folio.flujoDigital.find(x => x.Tipo == "SCORE");
                const informacionScore: IncodeScoreResponse = JSON.parse(digital.InformacionFlujo);
                const scoreResponses: Array<ScoreResponse> = []
                scoreResponses.push({
                    key: "VerificacionId", value: informacionScore.idValidation.overall.value, estado: informacionScore.idValidation.overall.status, color: this.ColorScore(informacionScore.idValidation.overall.value.replace(".", ","))
                });

                scoreResponses.push({
                    key: "ReconocimientoFacial", value: informacionScore.faceRecognition.overall.value, estado: informacionScore.faceRecognition.overall.status, color: this.ColorScore(informacionScore.faceRecognition.overall.value.replace(".", ","))
                });

                scoreResponses.push({
                    key: "DeteccionDeVida", value: informacionScore.liveness.overall.value, estado: informacionScore.liveness.overall.status, color: this.ColorScore(informacionScore.liveness.overall.value.replace(".", ","))
                });

                scoreResponses.push({
                    key: "ValidacionGobierno", value: informacionScore.governmentValidation.overall.value, estado: informacionScore.governmentValidation.overall.status, color: this.ColorScore(informacionScore.governmentValidation.overall.value.replace(".", ","))
                });
                
                return {
                    scoreResponse:scoreResponses,
                    puntajeTotal: informacionScore.overall.value,
                    estado: informacionScore.overall.status,
                    color: this.ColorScore(informacionScore.overall.value.replace(".", ",")),
                    nombre: fullname,
                    identificacion: info.Curp,
                    linkUrl: `{_incodeURL}/single-session/{solicitud.ID_SESSION_PROVEEDOR}`,
                    fechaInscripcion: digital.fechaFlujo
                }
            }
        } catch (error) {
            throw Error(`getScore: ${error.message}`)
        }
    }

    private ColorScore(score: string): string {
        const f = Number(score);
        if (f) {
            if (f >= 75) return "success";
            else if (f < 75 && f >= 50) return "warning";
            else if (f < 50) return "danger";
            else return "default";
        }
        else {
            return "default";
        }
    }
}