/* eslint-disable prettier/prettier */
import { SolicitudRepository } from '@app/infrastructure/f2pglobal/repositories/solicitud.repository';
import { EventLogContract } from '@app/shared/contracts/eventlog.contract';
import { AcctionType } from '@app/shared/enums/eventlog.enum';
import { Inject } from '@nestjs/common';
import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { UpdateOwnerDto } from '../../dtos/updateowner.dto';

export class UpdateOwnerCommand implements ICommand {
  constructor(public readonly dto: UpdateOwnerDto) {}
}

@CommandHandler(UpdateOwnerCommand)
export class UpdateOwnerHandler implements ICommandHandler<UpdateOwnerCommand, void> {
    constructor(private readonly repository: SolicitudRepository, 
        @Inject('CORE_SERVICE') private readonly client: ClientProxy) {}

    async execute(command: UpdateOwnerCommand): Promise<void> {
        const solicitud = await this.repository.findByCondition({where: {id: command.dto.id_Solicitud}});
        if(solicitud) {
            solicitud.propietario = command.dto.NuevoPropietario;
            await this.repository.save(solicitud);
            //AQUI SE DEBE DE ENVIAR LA NOTIFICACION
            const event: EventLogContract = {
                AcctionType: AcctionType.CAMBIO_PROPIETARIO,
                Observacion: `Se cambia propiestario de: ${command.dto.Propietario} a ${command.dto.NuevoPropietario} por ${command.dto.usuario}`,
                FechaLocal: command.dto.fechaLocal,
                Id_Solicitud: command.dto.id_Solicitud,
                Usuario: command.dto.usuario
            }
            this.client.emit<EventLogContract>('eventolog', event);
        } 
    }

}
