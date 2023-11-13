/* eslint-disable prettier/prettier */
import { GenericContract } from './generic.contract';
export class UpdateContract extends GenericContract {
    external_reference?: string | null;
    provider_session_id?: string | null
    subStatusKey?: string | null;
    email?: string | null;
    idOne?: string | null;
    idTwo?: string | null;
    phone?: string | null;
    fullName?: string | null;
    canalVenta?: string | null
}
