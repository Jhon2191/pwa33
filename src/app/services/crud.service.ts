import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor(private httpClient: HttpClient) { }

  /**
    * @author Fabian Duran
    * @createdate 2024-07-16
    * Metodo que retorna un posible error al llamado de una peticion HTTP.
    * @param error Informacion del error
  */
  handleError(error: HttpErrorResponse): Observable<never> {
    const dataError = { status: error.status, message: error.message };
    return throwError(() => dataError);
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-07-16
    * Metodo que ejecuta una peticion HTTP por GET.
    * @param url URL de la peticion.
    * @param filters Posibles filtros generados sobre la peticion.
    * @param paginator Paginacion sobre las tablas.
    * @param keysPaginator Nombres de las keys para las pagionaciones en los back.
  */
  getData({ url, filters = null, paginator = null, responseType = 'json', keysPaginator = ['page', 'perPage'] }): Observable<any> {
    let params = new HttpParams();
    if (paginator) {
      params = params.append(keysPaginator[0], paginator.pageIndex + 1)
        .append(keysPaginator[1], paginator.pageSize);
    }
    if (filters) {
      for (const key in filters) {
        if (filters[key] !== null) params = params.append(key, filters[key]);
      }
    }
    return this.httpClient.get<any>(url, { params: params, responseType: responseType as 'json' }).pipe(
      catchError(this.handleError)
    )
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-07-16
    * Metodo que ejecuta una peticion HTTP por POST.
    * @param url URL de la peticion.
    * @param formData Datos del formulario.
  */
  postData({ url, formData }): Observable<any> {
    return this.httpClient.post<any>(url, formData).pipe(
      catchError(this.handleError)
    )
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-07-16
    * Metodo que ejecuta una peticion HTTP por PUT.
    * @param url URL de la peticion.
    * @param formData Datos del formulario.
  */
  putData({ url, formData }): Observable<any> {
    return this.httpClient.put<any>(url, formData).pipe(
      catchError(this.handleError)
    )
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-07-16
    * Metodo que ejecuta una peticion HTTP por DELETE.
    * @param url URL de la peticion.
    * @param id del registro seleccionado.
  */
  deleteData({ url }): Observable<any> {
    return this.httpClient.delete<any>(`${url}`).pipe(
      catchError(this.handleError)
    )
  }
}