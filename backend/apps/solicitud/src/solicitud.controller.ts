import { Controller, Get } from '@nestjs/common';
import { SolicitudService } from './solicitud.service';

@Controller()
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) {}

  @Get()
  getHello(): string {
    return this.solicitudService.getHello();
  }
}
