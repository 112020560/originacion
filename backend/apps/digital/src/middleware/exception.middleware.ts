/* eslint-disable prettier/prettier */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'; 
import { Request, Response } from 'express'; 
 
@Catch(HttpException) 
export class HttpExceptionFilter implements ExceptionFilter { 
  catch(exception: HttpException, host: ArgumentsHost) { 
    const ctx = host.switchToHttp(); 
    const response = ctx.getResponse<Response>(); 
    const request = ctx.getRequest<Request>(); 
    const status = exception.getStatus(); 
    console.error('entre httperror');

    response 
      .status(status) 
      .json({
        Success: false,
        Message: `Error al procesar la solicitud` ,
        Errors : [`Error ${status} - ${exception.message} - ${exception.cause}`],
        statusCode: status, 
        timestamp: new Date().toISOString(), 
        path: request.url, 
      }); 
  } 
} 