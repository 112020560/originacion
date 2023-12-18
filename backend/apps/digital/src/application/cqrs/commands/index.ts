/* eslint-disable prettier/prettier */
import { IncodeStartSesionHandler } from "./incodestart.command";
import { ProcessFaceHandler } from "./processface.command";
import { ProcessIdHandler } from "./processid.command";
import { ProcessRecidenceHandler } from "./processrecidence.command";
import { ProcessSingHandler } from "./processsing.command";

export const commandHandlers = [
    IncodeStartSesionHandler,
    ProcessIdHandler,
    ProcessFaceHandler,
    ProcessRecidenceHandler,
    ProcessSingHandler
]