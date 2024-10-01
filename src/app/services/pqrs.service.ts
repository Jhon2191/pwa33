import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpError, SelectForm, DataObject, PqrsFormFormat, PqrsForm, ResponseSavePqrs, FilterSearchPqrs } from '../interfaces-types/interfaces';
import { FormGroup } from '@angular/forms';
import { AdditionalExternalData, PqrsSearch } from '../interfaces-types/search-pqrs.interface';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class PqrsService {
  urlPqrs: string = environment.URL_PQRS;

  constructor(private httpClient: HttpClient) { }

  /**
    * @author Fabian Duran
    * @createdate 2024-04-12
    * Metodo que retorna un posible error al llamado de una peticion HTTP.
    * @param error Informacion del error
  */
  handleError(error: HttpErrorResponse): Observable<never> {
    const dataError: HttpError = { status: error.status, message: error.message };
    return throwError(() => dataError);
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-12
    * Metodo que retorna la configuracion de los select para el formulario de registro.
  */
  getDataByForm(): Observable<PqrsFormFormat> {
    return this.httpClient.get<PqrsForm>(`${this.urlPqrs}pqrs/1/external-create`).pipe(
      map((res) => {
        const setRes = {
          incidents: res.incidents,
          document_types: this.convertJsonToList(res.document_types),
          genders: this.convertJsonToList(res.genders),
          claimant_types: this.convertJsonToList(res.claimant_types),
          companies: this.convertJsonToList(res.companies)
        }; 
        return setRes;
      }
      ),
      catchError(error => this.handleError(error))
    );
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-12
    * Metodo que convierte el JSON en una lista de SelectForm.
    * @param dataObject Objeto a transformar.
  */
  convertJsonToList(dataObject: DataObject): SelectForm[] {
    const listForm: SelectForm[] = [];
    for (const key in dataObject) listForm.push({ id: parseInt(key), name: dataObject[key] }); 
    return listForm;
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-15
    * Metodo que guarda una PQRS externa.
    * @param dataForm Informacion del formulario.
  */
  createPqrsExternal(dataForm: FormGroup): Observable<ResponseSavePqrs> {
    const getAllValues = dataForm.getRawValue();
    const formData = new FormData();
    for (const key in getAllValues) {
      if (key !== 'files') {
        if ((key === 'second_name' || key === 'second_last_name') && (getAllValues[key] !== null && getAllValues[key] !== '')) formData.append(key, getAllValues[key]);
        if (key === 'phone' && (getAllValues[key] !== null && getAllValues[key] !== '')) formData.append(key, getAllValues[key]);
        if (key === 'sub_incident_id' && getAllValues[key] !== null) formData.append(key, getAllValues[key]);
        if (key !== 'second_name' && key !== 'second_last_name' && key !== 'phone' && key !== 'sub_incident_id') formData.append(key, getAllValues[key]);
      } else getAllValues.files.forEach((item: any, index: number) => { formData.append(`files${index}`, item.file); });
    }
    return this.httpClient.post<ResponseSavePqrs>(`${this.urlPqrs}pqrs/1/external-store`, formData).pipe(
      catchError(this.handleError)
    );
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-15
    * Metodo consulta una PQRS dentro del sistema.
    * @param filter Filtro de busqueda.
  */
  searchPqrsExternal(filter: FilterSearchPqrs): Observable<AdditionalExternalData[]> {
    const httpParams = new HttpParams().append('verification_code', filter.verificationCode || '');
    return this.httpClient.get<PqrsSearch>(`${this.urlPqrs}pqrs/external-show/${filter.pqrsId}`, { params: httpParams }).pipe(
      map(res => {
        const listAddPropertyIncident = [];
        const addPropertyIncident: AdditionalExternalData = {
          ... res.pqrs.additional_external_data,
          document_type_id: res.pqrs.additional_external_data.document_type.id,
          num_document: this.getFormatDocument(res.pqrs.applicant.document),
          incident_id: res.pqrs.incident.id,
          text_incident: res.pqrs.incident.name,
          is_anonymous: res.pqrs.is_anonymous,
          description_facts: res.pqrs.description_facts,
          gender_id: res.pqrs.additional_external_data.gender.id,
          claimant_type_id: res.pqrs.additional_external_data.claimant_type.id,
          company_id: res.pqrs.additional_external_data.company.id,
          files: res.pqrs.attachments,
          created_at: moment(res.pqrs.additional_external_data.created_at).format('DD/MM/YYYY - HH:mm'),
          managements: res.pqrs.managements,
          state: res.pqrs.state,
          date: moment(res.pqrs.additional_external_data.created_at).format('DD/MM/YYYY - HH:mm'),
        };
        if (res.pqrs.additional_external_data.hasOwnProperty('sub_incident') && res.pqrs.additional_external_data.sub_incident !== null) {
          addPropertyIncident.sub_incident_id = res.pqrs.additional_external_data?.sub_incident?.id;
          addPropertyIncident.text_sub_incident = res.pqrs.additional_external_data?.sub_incident?.name || '';
        } 
        if (res.pqrs.additional_external_data.sub_incident === null) addPropertyIncident.text_sub_incident = 'N/R';
        listAddPropertyIncident.push(addPropertyIncident);
        
        return listAddPropertyIncident;
      }), 
      catchError(error => this.handleError(error))  
    )
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-16
    * Metodo que descarga un archivo seleccionado de la vista.
    * @param id ID del archivo.
    * @param type Tipo de store al cual se quiere acceder para descargar el archivo.  
  */
  getFile(id: number, type: string = 'pqrs-attachments'): Observable<any> {
    return this.httpClient.get<any>(`${this.urlPqrs}${type}/external-download/${id}`, { responseType: 'blob' as 'json' }).pipe(
      catchError(error => this.handleError(error))
    );
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-29
    * Metodo que valida el formato de la cadena de texto. 
    * @param document Documento del solicitante.
  */
  getFormatDocument(document: string): string {
    const stringToArrayDocument = document.split('-');
    return stringToArrayDocument[1] ? stringToArrayDocument[1] : document;
  }
}