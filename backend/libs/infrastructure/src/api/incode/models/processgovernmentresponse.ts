/* eslint-disable prettier/prettier */
export interface IncodeProcessGovernmentResponse {
    governmentValidation: GovernmentValidation | null;
}

export interface CurpVerification {
  success: boolean;
  curp: string;
  sex: string;
  nationality: string;
  result: string;
  renapo_valid: boolean;
  names: string;
  paternal_surname: string;
  mothers_maiden_name: string;
  birthdate: string;
  entity_birth: string;
  probation_document: string;
  probation_document_data: ProbationDocumentData;
  status_curp: string;
}

export interface FaceBrightness {
  value: string;
  status: string;
}

export interface FaceRecognition {
  maskCheck: MaskCheck;
  lensesCheck: LensesCheck;
  faceBrightness: FaceBrightness;
  overall: Overall;
}

export interface GovernmentValidation {
  validationStatus: ValidationStatus;
  ocrValidation: OcrValidation[];
  ocrValidationOverall: OcrValidationOverall;
  overall: Overall;
}

export interface IdOcrConfidence {
  overallConfidence: OverallConfidence;
}

export interface IdSpecific {
  value: string;
  status: string;
  key: string;
}

export interface IdValidation {
  photoSecurityAndQuality: PhotoSecurityAndQuality[];
  idSpecific: IdSpecific[];
  overall: Overall;
}

export interface IneScrapingValidation {
  scrapingStatus: string;
  success: boolean;
  result: string;
  resultDetails: string;
  screenshotUrl: string;
  cic: string;
  claveElector: string;
  numeroEmision: string;
  ocr: string;
  anioRegistro: string;
  anioEmision: string;
}

export interface LensesCheck {
  status: string;
}

export interface Liveness {
  livenessScore: LivenessScore;
  photoQuality: PhotoQuality;
  overall: Overall;
}

export interface LivenessScore {
  value: string;
  status: string;
}

export interface MaskCheck {
  value: string;
  status: string;
}

export interface OcrValidation {
  value: string;
  status: string;
  key: string;
}

export interface OcrValidationOverall {
  value: string;
  status: string;
}

export interface Overall {
  value: string;
  status: string;
}

export interface OverallConfidence {
  value: string;
  status: string;
}

export interface PhotoQuality {
  value: string;
}

export interface PhotoSecurityAndQuality {
  value: string;
  status: string;
  key: string;
}

export interface ProbationDocumentData {
  foja: string;
  numEntidadReg: string;
  libro: string;
  NumRegExtranjeros: string;
  cveEntidadNac: string;
  numActa: string;
  CRIP: string;
  tomo: string;
  cveEntidadEmisora: string;
  anioReg: string;
  cveMunicipioReg: string;
  FolioCarta: string;
}

export interface RetryInfo {
  failedAttemptsCounter: any | null;
  stepsToRetry: string[] | null;
}

export interface IncodeScoreResponse {
  idValidation: IdValidation;
  liveness: Liveness;
  faceRecognition: FaceRecognition;
  governmentValidation: GovernmentValidation;
  curpVerification: CurpVerification;
  ineScrapingValidation: IneScrapingValidation;
  idOcrConfidence: IdOcrConfidence;
  retryInfo: RetryInfo;
  overall: Overall;
  reasonMsg: string;
}

export interface ValidationStatus {
  value: string;
  status: string;
  key: string;
}
