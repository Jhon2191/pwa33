import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  constructor() {}

  alertSuccess(title: string, text: string, options: any = {}) {
    Swal.fire({
      title,
      html: text,
      icon: 'success',
      showConfirmButton: false,
      timer: 3000,
      ...options,
    });
  }

  alertError(title: string, text: string, options: any = {}) {
    Swal.fire({
      title,
      html: text,
      icon: 'error',
      confirmButtonText: 'Aceptar',
      ...options,
    });
  }

  dangerError(title: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-start',
      showConfirmButton: false,
      timer: 10000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: 'error',
      title,
    });
  }

  alertWarning(
    title: string,
    text: string,
    buttonTextConfirm: string = 'Aceptar',
    buttonTextCancel: string = 'Cancelar'
  ) {
    return Swal.fire({
      title,
      html: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2CABBC',
      confirmButtonText: buttonTextConfirm,
      cancelButtonText: buttonTextCancel,
      reverseButtons: true,
    });
  }

  alertQuestion(title: string, text: string) {
    return Swal.fire({
      title,
      html: text,
      imageUrl: 'assets/images/iconQuestion.png',
      showCloseButton: true,
      showConfirmButton: false,
      width: 700,
    });
  }

  alertWarningV2(title: string, text: string) {
    return Swal.fire({
      title,
      html: text,
      icon: 'warning',
    });
  }

  alertInfo(title: string, text: string) {
    Swal.fire({
      title,
      text,
      icon: 'info',
      confirmButtonText: 'Aceptar',
    });
  }

  alertConfirm(title: string, text?: string) {
    return Swal.fire({
      title,
      text,
      icon: 'info',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: `Si`,
      denyButtonText: `No`,
      allowOutsideClick: false,
    });
  }

  alertSuccessWithoutButton(title: string, text: string) {
    Swal.fire({
      title,
      html: text,
      icon: 'success',
      showConfirmButton: false,
      timer: 4000,
    });
  }

  alertSuccessButtonText(title: string, text: string, btnText: string) {
    Swal.fire({
      title,
      html: text,
      icon: 'success',
      confirmButtonText: btnText,
    });
  }

  alertWithAnyProperties(
    title: string,
    html: any,
    icon: any,
    confirmButtonText: string
  ) {
    return Swal.fire({
      title,
      html,
      icon,
      confirmButtonText,
      confirmButtonColor: '#2cabbc',
    });
  }

  alertSuccessMovistar(title: string, text: string, options: any = {}) {
    Swal.fire({
      title,
      html: text,
      icon: 'warning',
      showConfirmButton: false,
      timer: 8000,
      ...options,
    });
  }

  alertSmallNotification(position: any, icon: any, title: string) {
    const Toast = Swal.mixin({
      toast: true,
      position,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
    Toast.fire({
      icon,
      title,
    });
  }
}
