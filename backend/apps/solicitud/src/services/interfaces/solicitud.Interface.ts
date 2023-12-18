/* eslint-disable prettier/prettier */
export interface IGlobalDbService {
    updateData(id_solicitud: number, id_impresion: number, date: Date, username: string): Promise<void>;
    addorUpdateAccountBank(action: string, solicitud: number, account: string, bank: string, user: string, date: Date): Promise<void>;
}