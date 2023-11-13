/* eslint-disable prettier/prettier */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'; 
import { Request, Response } from 'express'; 
 
@Catch(HttpException) 
export class HttpExceptionFilter implements ExceptionFilter { 
  catch(exception: HttpException, host: ArgumentsHost) { 
    const ctx = host.switchToHttp(); 
    const response = ctx.getResponse<Response>(); 
    const request = ctx.getRequest<Request>(); 
    const status = exception.getStatus(); 
    console.error(exception);

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
 
 
@Catch(Error) 
export class ErrorFilter implements ExceptionFilter { 
  catch(exception: Error, host: ArgumentsHost) { 
    
    const ctx = host.switchToHttp(); 
    const response = ctx.getResponse<Response>(); 
    const request = ctx.getRequest<Request>(); 
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR 
    console.error('entre error');

    response 
      .status(status) 
      .json({
        Success: false,
        Message: `Error al procesar la solicitud` ,
        Errors : [`${exception}`],
        statusCode: status, 
        timestamp: new Date().toISOString(), 
        path: request.url, 
      }); 
  } 
} 