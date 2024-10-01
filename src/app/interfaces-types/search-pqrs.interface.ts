export interface PqrsSearch {
  pqrs: Pqrs;
}

export interface Pqrs {
  id: number;
  applicant_type: number;
  description_facts: string;
  is_anonymous: number;
  created_at: Date;
  updated_at: Date;
  applicant_type_name: string;
  color_state: ColorState;
  additional_external_data: AdditionalExternalData;
  applicant: Applicant;
  survey: null;
  procedure: Incident;
  incident: Incident;
  attachments: Incident[];
  managements: Management[];
  traffic_light: null;
  state: string;
}

export interface AdditionalExternalData {
  id: number;
  pqrs_id: number;
  first_name: string;
  second_name: string | null;
  first_last_name: string;
  second_last_name: string | null;
  phone: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  sub_incident?: Incident | null;
  document_type: Incident;
  gender: Incident;
  claimant_type: Incident;
  company: Incident;
  document_type_id: number;
  num_document: string;
  cel_phone: string;
  email: string;
  incident_id: number;
  text_incident: string;
  sub_incident_id?: number;
  text_sub_incident: string;
  files: any[];
  is_anonymous: number;
  description_facts: string;
  claimant_type_id: number;
  company_id: number;
  gender_id: number;
  date: string;
  managements: Management[];
  state: string;
};

export interface Incident {
  id: number;
  name: string;
};

export interface Applicant {
  id: number;
  name: string;
  document: string;
  email: string;
  phone: null;
};

export interface ColorState {
  color: string;
  name: string;
  id: number;
};

export interface ConfigTable {
  name: string;
  key: string;
};

export interface DataDialogPqrs {
  pqrs: AdditionalExternalData;
};

export interface Management {
  id: number;
  response: string;
  responsible: Responsible;
  attachments: any[];
  management_state: ManagementState;
  prioritie: ManagementState;
}

export interface ManagementState {
  id: number;
  name: string;
  description: string;
  pqrs_state?: ManagementState;
}

export interface Responsible {
  id: number;
  rrhh_id: number;
  ciu_role: string;
  name: string;
  document: string;
  email: string;
  phone: null;
}