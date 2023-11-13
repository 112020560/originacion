import { Injectable } from '@nestjs/common';

@Injectable()
export class SolicitudService {
  getHello(): string {
    return 'Hello World!';
  }
}
