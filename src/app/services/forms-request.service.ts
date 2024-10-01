import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';

const CRM_URL = environment.CRM_URL;
const CRM2_URL = environment.CRM2_URL;
const CIU_URL = environment.CIU_URL;

@Injectable({
  providedIn: 'root'
})

export class FormsRequestService {

  // private URL = environment.local_URL
  constructor(private http: HttpClient, private AuthService:AuthService) { }


  getForm(direction, size, page){
    if (size === 0 || page === 0) {
      return this.http.get<any>(`${CRM_URL}${direction}`);
    } else {
      return this.http.get<any>(`${CRM_URL}${direction}?n=${size}&page=${page}`);
    }
   }
  postForm(direction, form){
    return this.http.post<any>(`${CRM_URL}${direction}/`, form);
  }

  postFormCrm2(direction, form){
    return this.http.post<any>(`${CRM2_URL}${direction}/`, form);
  }

  postForm1(direction, form){
    return this.http.post<any>(`${CRM_URL}${direction}`, form);
  }
  putForm(direction, form){
    return this.http.put<any>(`${CRM_URL}${direction}/`, form);
  }
  getRols(direction){
    return this.http.get<any>(`${CIU_URL}${direction}/`);
   }


   getHistory(id){
    return this.http.get<any>(`${CRM_URL}formanswer/historic/${id}`);
   }

   getPageHistory(url){
    return this.http.get<any>(`${url}`);
   }

   getFormByUser(direction, id, size, page){
    return this.http.get<any>(`${CRM_URL}${direction}${id}?n=${size}&page=${page}`);
  }

  postReport(obj){
    return this.http.post<any>(`${CRM_URL}report`, obj, {responseType: 'blob' as 'json'});
  }

  updateInfo(form, id){
    return this.http.post(`${CRM_URL}formanswer/update/${id}`, form);
  }

  getPrechargeField(id) {
    return this.http.get(`${CRM_URL}searchPrechargeFields/${id}`)
  }

  getPlantilla(parameters){
    return this.http.get<any>(`${CRM_URL}form/dowload/${parameters}`,{responseType: 'blob' as 'json'});
  }

  getAssignations(formId) {
    return this.http.get(`${CRM_URL}tray/assignedClients/${formId}`)
  }

  getData(endpoint){
    return this.http.get<any>(`${CRM_URL}${endpoint}`);
  }

  /**
   * Metodo que se encarga de obtener el formulario de CRM2
   * @author Juan David Guerrero Vargas
   * @param endpoint:string {string} cadena de texo con el enpoint a ejecutar
   * @returns Observable {Observable}
   */
  getDataCrmTwo(endpoint:string):Observable<any>{
    return this.http.get<any>(`${CRM2_URL}${endpoint}`);
  }

   addSection(request){
    return this.http.post<any>(`${CRM_URL}addSection/`, request);
  }


}
