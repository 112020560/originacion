/* eslint-disable prettier/prettier */
import { FolioInterfaceRepository } from "@app/infrastructure/mongodb/interfaces/folio.interface";
import { EVENT_LOG, UPDATE_STATUS } from "@app/shared/Const/events.const";
import { EventLogContract } from "@app/shared/contracts/eventlog.contract";
import { UpdateStatusContract } from "@app/shared/contracts/updatestatus.contract";
import { AcctionType } from "@app/shared/enums/eventlog.enum";
import { ClientProxy } from "@nestjs/microservices";


export class ServicesEventExtension {
    readonly folioRepository: FolioInterfaceRepository;
    readonly coreproxy: ClientProxy;
    constructor(folioRepository: FolioInterfaceRepository,
        coreproxy: ClientProxy
    ) {
        this.folioRepository = folioRepository;
        this.coreproxy = coreproxy;
    }


    public sendEventLog(accionType: AcctionType, idsolicitud: number, date: Date, user: string, eventDescription: string) {
        const event: EventLogContract = {
            AcctionType: accionType,
            FechaLocal: date,
            Id_Solicitud: idsolicitud,
            Usuario: user,
            Observacion: eventDescription
        }
        this.coreproxy.emit(EVENT_LOG, event);
    }

    public sendUpdateStatus(idsolicitud: number, date: Date, user: string, statusKey: string) {
        const payload: UpdateStatusContract = {
            id_solicitud: idsolicitud,
            fecha: date,
            usuario: user,
            statusKey: '',
            substatusKey: statusKey
        }

        this.coreproxy.emit(UPDATE_STATUS, payload)
    }

    public listaImagenes(tipo: string): string[] {
        switch (tipo) {
            case 'biometric':
                return ["selfie", "fullFrameFrontID", "fullFrameBackID", "document"];
            case 'recidence':
                return ["selfie", "fullFrameFrontID", "fullFrameBackID", "document", "addressStatement"]
            case 'sign': return ["signature"]
            default:
                return []
        }
    }
}