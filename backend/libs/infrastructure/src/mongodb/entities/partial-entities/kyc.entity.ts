/* eslint-disable prettier/prettier */
import { Prop } from "@nestjs/mongoose";
import {} from 'class-validator'


export class InformacionPersonal {
  @Prop()
  Nombre: string;
  @Prop()
  SegundoNombre: string;
  @Prop()
  ApellidoPaterno: string;
  @Prop()
  ApellidoMaterno: string;
  @Prop()
  Genero: string;
  @Prop()
  FechaNacimiento: number;
  @Prop()
  LugarNacimiento: string;
  @Prop()
  Curp: string;
  @Prop()
  Rfc: string;
  @Prop()
  CorreoElectronico: string;
  @Prop()
  TelefonoCelular: string;
  @Prop()
  OtroTelefono: string;
  @Prop(() => Referido)
  Referidos: Referido[];
  @Prop()
  Profesion: string;
  @Prop()
  Oficio: string;
  @Prop()
  IngresoMensualBruto: number;
}

export class Referido {
  @Prop()
  Nombre: string;
  @Prop()
  Telefono: string;
  @Prop()
  Parentesco: string;
  @Prop()
  Direccion: string;
}

export class InformacionGeografica {
  @Prop()
  Calle: string;
  @Prop()
  NumExt: string;
  @Prop()
  NumInt: string;
  @Prop()
  CodigoPostal: string;
  @Prop()
  Colonia: string;
  @Prop()
  Municipio: string;
  @Prop()
  Estado: string;
}

export class InformacionLaboral {
  @Prop()
  Profesion: string;
  @Prop()
  Oficio: string;
  @Prop()
  Patrono: string;
  @Prop()
  TelefonoTrabajo: string;
  @Prop()
  IngresoMensualBruto: number;
  @Prop()
  IdentificadorEva: string;
}

export class InformacionPreguntas {
  @Prop()
  TarjetaCredito: boolean;
  @Prop()
  NumTarjetaCredito: string;
  @Prop()
  CreditoHipotecario: boolean;
  @Prop()
  CreditoAutomotriz: boolean;
}

export class InformacionAdicional {
  @Prop()
  AceptaTerminosyCondiciones: boolean;
  @Prop()
  AceptaAccederCirculoCredito: boolean;
  @Prop()
  AceptaMediosElectronicos: boolean;
  @Prop()
  Pin: string;
  @Prop()
  CanalVenta?: string;
}

export class KyC {
  @Prop(() => InformacionPersonal)
  informacionPersonal: InformacionPersonal;
  @Prop(() => InformacionGeografica)
  informacionGeografica: InformacionGeografica;
  @Prop(() => InformacionLaboral)
  informacionLaboral: InformacionLaboral;
  @Prop(() => InformacionLaboral)
  informacionPreguntas: InformacionPreguntas;
  @Prop(() => InformacionAdicional)
  informacionAdicional: InformacionAdicional;
}

