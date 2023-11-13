/* eslint-disable prettier/prettier */
export interface GenericCustomResponse<T> {
  Success: boolean;
  Message?: string;
  Errors?: string[];
  Data?: T;
}


export interface CustomResponse {
    Success: boolean;
    Message?: string;
    Errors?: string[];
    Data?: any;
  }
  

