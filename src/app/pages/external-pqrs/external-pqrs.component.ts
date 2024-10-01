import { Component, OnInit } from '@angular/core';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-external-pqrs',
  templateUrl: './external-pqrs.component.html',
  styleUrls: ['./external-pqrs.component.css']
})
export class ExternalPqrsComponent implements OnInit { 
  acceptTerms: number | null = null;
  stateStepPolicies: boolean = false;
  stateStepRegister: boolean = true;
  selectIndexTab: number = 0;
  
  constructor(private sweetAlertService: SweetAlertService) { }

  ngOnInit(): void {
   
  }

  /**
    * @author Fabian Duran
    * @createdate 2024-04-15
    * Evento cuando se da clic sobre el boton enviar.
  */
  onClickButtonAcceptTerms(): void {
    if (this.acceptTerms === 1) {
      this.stateStepRegister = false;
      this.stateStepPolicies = true;
      this.selectIndexTab = 1;
    } else {
      this.sweetAlertService.showAlertConfirm({ title: '¿Está seguro?', text: '¿No desea aceptar las políticas de tratamiento de datos y aviso de privacidad?', icon: 'question' }).then(confirm => {
        if (confirm.isConfirmed) window.location.href = 'https://groupcosbpo.com/'; 
      });
    }
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-15
    * Metodo que resetea el estado de los step.
  */
  onSubmitForm(): void {
    this.acceptTerms = null;
    this.selectIndexTab = 0;
    this.stateStepRegister = true;
    this.stateStepPolicies = false;
  }
}