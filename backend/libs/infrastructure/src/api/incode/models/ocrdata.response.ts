/* eslint-disable prettier/prettier */
export interface AddressFields {
    street: string | null;
    colony: string | null;
    postalCode: string | null;
    city: string | null;
    state: string | null;
}

export interface CheckedAddressBean {
    colony: string | null;
    postalCode: string | null;
    city: string | null;
    state: string | null;
    label: string | null;
    zipColonyOptions: any[];
}

export interface Name {
    fullName: string | null;
    machineReadableFullName: string | null;
    firstName: string | null;
    givenName: string | null;
    givenNameMrz: string | null;
    paternalLastName: string | null;
    maternalLastName: string | null;
    lastNameMrz: string | null;
}

export interface OcrDataConfidence {
    birthDateConfidence: number;
    nameConfidence: number;
    givenNameConfidence: number;
    mothersSurnameConfidence: number;
    fathersSurnameConfidence: number;
    fullNameMrzConfidence: number;
    addressConfidence: number;
    streetConfidence: number;
    colonyConfidence: number;
    postalCodeConfidence: number;
    cityConfidence: number;
    stateConfidence: number;
    stateCodeConfidence: number;
    genderConfidence: number;
    expirationDateConfidence: number;
    expireAtConfidence: number;
    mrz1Confidence: number;
    mrz2Confidence: number;
    mrz3Confidence: number;
    documentNumberConfidence: number;
    backNumberConfidence: number;
    personalNumberConfidence: number;
    claveDeElectorConfidence: number;
    numeroEmisionCredencialConfidence: number;
    curpConfidence: number;
    nationalityConfidence: number;
    nationalityMrzConfidence: number;
}

export interface AddressFieldsFromStatement {
    street: string | null;
    colony: string | null;
    postalCode: string | null;
    city: string | null;
    state: string | null;
}

export interface OcrData {
    name: Name;
    address: string | null;
    addressFields: AddressFields;
    fullAddress: boolean;
    invalidAddress: boolean;
    checkedAddress: string | null;
    checkedAddressBean: CheckedAddressBean;
    exteriorNumber: string | null;
    interiorNumber: string | null;
    typeOfId: string | null;
    documentFrontSubtype: string | null;
    documentBackSubtype: string | null;
    birthDate: number;
    gender: string | null;
    claveDeElector: string | null;
    curp: string | null;
    numeroEmisionCredencial: string | null;
    cic: string | null;
    ocr: string | null;
    expireAt: string | null;
    expirationDate: number;
    issueDate: number;
    registrationDate: number;
    additionalTimestamps: any[];
    issuingCountry: string | null;
    nationality: string | null;
    nationalityMrz: string | null;
    notExtracted: number;
    notExtractedDetails: any[];
    mrz1: string | null;
    mrz2: string | null;
    mrz3: string | null;
    fullNameMrz: string | null;
    documentNumberCheckDigit: string | null;
    dateOfBirthCheckDigit: string | null;
    expirationDateCheckDigit: string | null;
    ocrDataConfidence: OcrDataConfidence;
    addressFromStatement: string | null;
    invalidAddressFromStatement: boolean;
    addressStatementEmissionDate: number;
    documentType: string | null;
    addressFieldsFromStatement: AddressFieldsFromStatement | null;
}

export interface IncodeOcrDataResponse {
    ocrData: OcrData;
}
