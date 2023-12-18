/* eslint-disable prettier/prettier */
export interface Response<T> {
  Success: boolean;
  Message?: string;
  Errors?: string[];
  Data?: T;
}
