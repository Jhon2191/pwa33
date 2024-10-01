import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DestroyComponentService {

  private destroys = new Subject();

  constructor() { }

  /**
   * Metodo que destruye todas las peticiones antes de cerrar el componente
   */
  destroyComponent(): void{

    this.destroys.next(true);
    this.destroys.complete();

  }
}
