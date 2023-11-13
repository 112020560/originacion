/* eslint-disable prettier/prettier */
export interface BackEndResponse<T> {
  ResponseCode: string;
  ResponseData: T;
  Message: string;
  ErrorMessage: string;
}
