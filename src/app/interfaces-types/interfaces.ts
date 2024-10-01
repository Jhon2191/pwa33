import { SweetAlertIcon } from 'sweetalert2';

export interface HttpError {
  status: number;
  message: string;
};

export interface Alert {
  title?: string;
  text: string;
  icon?: SweetAlertIcon
};

export interface Pqrs {
  incident_id: string;
  sub_incident_id: string;
  is_anonymous: string;
  document_type_id: string;
  num_document: string;
  first_name: string;
  second_name: string;
  first_last_name: string;
  second_last_name: string;
  phone: string;
  cel_phone: string;
  email: string;
  claimant_type_id: string;
  company_id: string;
  gender_id: string;
  description_facts: string;
  files: any[];
  date: string;
}

export interface PqrsForm {
  incidents: Incident[];
  document_types: DataObject;
  genders: DataObject;
  claimant_types: DataObject;
  companies: DataObject;
}

export interface PqrsFormFormat {
  incidents: Incident[];
  document_types: SelectForm[];
  genders: SelectForm[];
  claimant_types: SelectForm[];
  companies: SelectForm[];
}

export interface Incident {
  id: number;
  name: string;
  sub_incidents: SubIncident[];
}

export interface SubIncident {
  id: number;
  name: string;
}

export interface SelectForm {
  id: number;
  name: string;
}

export interface DataObject {
  [key: string]: string;
}

export interface ResponseSavePqrs {
  message: string;
  pqrs_id: number;
  verification_code: string;
}

export interface FilterSearchPqrs {
  pqrsId: number | null;
  verificationCode: string | null;
}