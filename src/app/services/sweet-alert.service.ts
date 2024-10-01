import { Injectable } from '@angular/core';
import swal, { SweetAlertResult } from 'sweetalert2';
import { Alert } from '../interfaces-types/interfaces';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {

  constructor() { }

  /**
    * @author Fabian Duran
    * @createdate 2023-11-30
    * Metodo que retorna un sweetAlert.
    * @param params Propiedades de la alerta. 
  */
  showAlert(params: Alert): Promise<SweetAlertResult> {
    return swal.fire({
      title: params.title,
      html: params.text,
      icon: params.icon,
      confirmButtonColor: '#00acc1'
    });
  }
  /**
    * @author Fabian Duran
    * @createdate 2023-11-30
    * Metodo que retorna un sweetAlert de tipo confirmacion.
    * @param params Propiedades de la alerta. 
  */
  showAlertConfirm(params: Alert): Promise<SweetAlertResult> {
    return swal.fire({
      title: params.title,
      html: params.text,
      icon: params.icon,
      showCancelButton: true,
      confirmButtonText: 'Si',
      confirmButtonColor: '#00acc1',
      cancelButtonText: 'Cancelar'
    });
  }
}