/* eslint-disable prettier/prettier */
export interface IncodeProcessFaceResponse {
  confidence: number;
  existingUser: boolean;
  existingInterviewId: string | null;
  nameMatched: boolean;
  existingExternalId: string | null;
}
