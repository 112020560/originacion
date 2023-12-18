/* eslint-disable prettier/prettier */

import { InformacionAdicional, InformacionGeografica, InformacionLaboral, InformacionPersonal, InformacionPreguntas } from "@app/infrastructure/mongodb/entities/partial-entities/kyc.entity";


// export class InformacionPersonal {
//   Nombre?: string | null;
//   SegundoNombre?: string | null;
//   ApellidoPaterno?: string | null;
//   ApellidoMaterno?: string | null;
//   Genero?: string | null;
//   FechaNacimiento?: number;
//   LugarNacimiento?: string | null;
//   Curp?: string | null;
//   Rfc?: string | null;
//   CorreoElectronico?: string | null;
//   TelefonoCelular?: string | null;
//   OtroTelefono?: string | null;
//   Referidos?: Referidos[] | null;
//   Profesion?: string | null;
//   Oficio?: string | null;
//   IngresoMensualBruto?: number;
// }

// export class InformacionGeografica {
//   Calle?: string | null;
//   NumExt?: string | null;
//   NumInt?: string | null;
//   CodigoPostal?: string | null;
//   Colonia?: string | null;
//   Municipio?: string | null;
//   Estado?: string | null;
// }

// export class InformacionLaboral {
//   Profesion?: string | null;
//   Oficio?: string | null;
//   Patrono?: string | null;
//   TelefonoTrabajo?: string | null;
//   IngresoMensualBruto?: number;
//   IdentificadorEva?: string | null;
// }

// export class InformacionPreguntas {
//   TarjetaCredito?: boolean;
//   NumTarjetaCredito?: string | null;
//   CreditoHipotecario?: boolean;
//   CreditoAutomotriz?: boolean;
// }

// export class InformacionAdicional {
//   AceptaTerminosyCondiciones?: boolean;
//   AceptaAccederCirculoCredito?: boolean;
//   AceptaMediosElectronicos?: boolean;
//   Pin?: string | null;
// }

// export class Referidos {
//   Nombre?: string | null;
//   Telefono?: string | null;
//   Parentesco?: string | null;
//   Direccion?: string | null;
// }

// export class SolicitudKyCModel {
//   Id?: number;
//   Id_Solicitud?: number;
//   Informacion?: Informacion | null;
//   Usuario?: string | null;
//   FechaLocal?: string;
// }

export class Informacion {
  informacionPersonal?: InformacionPersonal | null;
  informacionGeografica?: InformacionGeografica | null;
  informacionLaboral?: InformacionLaboral | null;
  informacionPreguntas?: InformacionPreguntas | null;
  informacionAdicional?: InformacionAdicional | null;
}