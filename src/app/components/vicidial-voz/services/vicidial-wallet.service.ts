import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class VicidialWalletService {
  private storageSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('incomming_call_phone')
  );

  constructor(private authService: AuthService) {
    window.addEventListener('storage', (event) => {
      if (event.key === 'incomming_call_phone') {
        this.storageSubject.next(event.newValue);
      }
    });
  }

  /**
   * Método que retorna el BehaivorSubject que se actualizara en el momento que una llamada sea recibida
   * @author Juan Carlos Alonso
   * @createdate 2023-10-03
   */
  getVicidialIncommingCallPhone(): Observable<string | null> {
    return this.storageSubject.asObservable();
  }

  /**
   * Método que recibe el telefono, lo almacena en el local storage y notifica a la subscripción el cambio
   * @author Juan Carlos Alonso
   * @createdate 2023-10-03
   * @param phone telefono en formato de texto
  */
  setVicidialIncommingCallPhone(phone: any) {
    localStorage.setItem('incomming_call_phone', phone);
    this.storageSubject.next(phone);
  }

  /**
   * Método que elimina el item del local storage y notifica a la subscripción el cambio
   * @author Juan Carlos Alonso
   * @createdate 2023-10-03
   * @param phone telefono en formato de texto
  */
  deleteVicidialIncommingCallPhone() {
    localStorage.removeItem('incomming_call_phone');
    this.storageSubject.next(null);
  }

}
