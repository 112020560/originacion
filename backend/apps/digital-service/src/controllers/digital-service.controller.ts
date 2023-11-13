/* eslint-disable prettier/prettier */
import { CREATE_DIGITAL_LINK, VALIDATE_DIGITAL_TOKEN } from '@app/shared/Const/events.const';
import { GenerateLinkContract } from '@app/shared/contracts/generatelink.contract';
import { LinkResponse } from '@app/shared/contracts/linkresponse.model';
import { ValidateLinkContract } from '@app/shared/contracts/validatelink.contract';
import { ValidacionTokenLinkModel } from '@app/shared/contracts/validatelink.model';
import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { DigitalService } from '../services/digitalurl.service';

@Controller()
export class DigitalController {
  constructor(private digitalService: DigitalService) {}

  //request-response pattern
  @MessagePattern(VALIDATE_DIGITAL_TOKEN)
  async validateDigitalToken(@Payload() data: ValidateLinkContract, @Ctx() context: RmqContext): Promise<ValidacionTokenLinkModel> {
    console.log(data)
    //const channel = context.getChannelRef();
    //const originalMsg = context.getMessage();
    const res = await this.digitalService.validateLink(data)
    //channel.ack(originalMsg);
    return res;
  }

  @MessagePattern(CREATE_DIGITAL_LINK)
  async createDigitalToken(@Payload() data: GenerateLinkContract,): Promise<LinkResponse> {
    console.log(data)
    //process data
    const res = await this.digitalService.generateLink(data)
    //acknowledge the message
    return res;
  }
}
