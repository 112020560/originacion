/* eslint-disable prettier/prettier */
import { GenericDto } from './generic.dto';

export class UpdateOwnerDto extends GenericDto {
  Propietario: string;
  NuevoPropietario: string;
  Observacion: string;
}
