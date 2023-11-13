/* eslint-disable prettier/prettier */
export interface IncodeStartSessionResponse {
  interviewId?: string | null;
  token?: string | null;
  interviewCode?: string | null;
  flowType?: string | null;
  idCaptureTimeout?: number;
  selfieCaptureTimeout?: number;
  idCaptureRetries?: number;
  selfieCaptureRetries?: number;
  curpValidationRetries?: number;
  clientId?: string | null;
  env?: string | null;
  existingSession?: boolean;
}
