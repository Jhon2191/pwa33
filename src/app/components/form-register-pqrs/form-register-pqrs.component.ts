import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { PqrsFormFormat, SubIncident } from 'src/app/interfaces-types/interfaces';
import { ValidKeys } from 'src/app/interfaces-types/types';
import { PqrsService } from '../../services/pqrs.service';
import { validateSizeFiles } from '../../validators/custom-validators';
import { AdditionalExternalData } from 'src/app/interfaces-types/search-pqrs.interface';
import { saveAs as importedSaveAs } from 'file-saver';

@Component({
  selector: 'app-form-register-pqrs',
  templateUrl: './form-register-pqrs.component.html',
  styleUrls: ['./form-register-pqrs.component.css']
})
export class FormRegisterPqrsComponent implements OnInit, OnChanges {
  @Input() dataPqrsView: AdditionalExternalData | null = null;
  @Input() disabledFields: boolean = false;
  @Output() onSubmitForm: EventEmitter<void> = new EventEmitter<void>();
  formPqrsExternal: FormGroup = new FormGroup({
    pqrs_id: new FormControl(''),
    incident_id: new FormControl('', [Validators.required]),
    sub_incident_id: new FormControl({ value: null, disabled: true }, [Validators.required]),
    is_anonymous: new FormControl('', [Validators.required]),
    document_type_id: new FormControl('', [Validators.required]),
    num_document: new FormControl('', [Validators.required]),
    first_name: new FormControl('', [Validators.required, Validators.pattern("^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s']+$")]),
    second_name: new FormControl('', [Validators.pattern("^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s']+$")]),
    first_last_name: new FormControl('', [Validators.required, Validators.pattern("^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s']+$")]),
    second_last_name: new FormControl('', [Validators.pattern("^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s']+$")]),
    phone: new FormControl('', []),
    cel_phone: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    claimant_type_id: new FormControl('', [Validators.required]),
    company_id: new FormControl('', [Validators.required]),
    gender_id: new FormControl('', [Validators.required]),
    description_facts: new FormControl('', [Validators.required]),
    files: this.formBuilder.array([], [validateSizeFiles])
  });
  separatorKeysCodes: number[] = [ENTER, COMMA];
  dataForm!: PqrsFormFormat;
  subTypesPqrs: SubIncident[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private alertService: SweetAlertService,
    private pqrsService: PqrsService
  ) { }

  ngOnInit(): void {
    this.pqrsService.getDataByForm().subscribe(res => {
      this.dataForm = res;
      this.onLoadDataPqrs(false);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['disabledFields'].currentValue) this.onLoadDataPqrs(true);
  }

  /**
   * @author Fabian Duran
   * @createdate 2024-03-20
   * Metodo que retorna los errores generados por el formulario. 
 */
  get error(): any {
    return this.formPqrsExternal.controls;
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-03-20
    * Metodo que retorna la lista de files del formulario. 
  */
  getArrayFiles() {
    return (this.formPqrsExternal.get('files') as FormArray).controls;
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-03-20
    * Metodo agrega un archivo a la lista de archivos del formulario. 
    * @param $event Evento emitido por el campo tipo archivo. 
  */
  addFile($event: any) {
    const files = $event.target.files;
    for (let i = 0; i < files.length; i++) {
      const newFormGroup = this.formBuilder.group({ file: new FormControl(files[i], []) });
      const arrayForm = this.formPqrsExternal.get('files') as FormArray;
      arrayForm.push(newFormGroup);
    }
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-03-20
    * Metodo que elimina una cadena de texto dentro un chip list.
    * @param index Indice de la lista seleccionada. 
  */
  removeItem(index: number): void {
    const arrayForm = this.formPqrsExternal.get('files') as FormArray;
    arrayForm.removeAt(index);
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-03-20
    * Metodo que guarda una PQRS en el sistema.
  */
  onSaveForm(): void {
    if (this.formPqrsExternal.valid) {
      this.alertService.showAlertConfirm({ title: '¿Está seguro?', text: '¿De registrar la PQRS?', icon: 'question' }).then(confirm => {
        if (confirm.isConfirmed) {
          this.pqrsService.createPqrsExternal(this.formPqrsExternal).subscribe(res => {
            this.alertService.showAlert({ title: 'Correcto', text: `Su solicitud se ha generado con éxito con el No. de radicado: <b>${res.pqrs_id}</b>. <br/> Usted puede consultar este radicado con el siguiente Código de seguridad: <b>${res.verification_code}</b>`, icon: 'success' }).then(confirm => {
              if (confirm.isConfirmed || confirm.isDismissed) {
                this.onSubmitForm.emit();
                this.onResetForm();
              }
            });
          });
        }
      });
    } else this.formPqrsExternal.markAllAsTouched();
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-03-20
    * Metodo que limpia el contenido del formulario.
  */
  onResetForm(): void {
    this.formPqrsExternal.reset();
    (this.formPqrsExternal.get('files') as FormArray).clear();
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-04
    * Metodo que valida el tipo de radicador para cambiar el estado de los campos.
    * @param $event Evento emitido por el select.
  */
  onChangeRadicalAsAPerson($event: MatSelectChange): void {
    if ($event.value === 1) this.changeStateAndValuesForm(true);
    else this.changeStateAndValuesForm(false);
    this.filterDataFormValuesZero($event.value);
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-04
    * Metodo que filtra o añade opciones con ID 0 dependiendo el tipo de anonimo.
    * @param is_anonymous Valor del campo anonimo.
  */
  filterDataFormValuesZero(is_anonymous: number): void {
    if (is_anonymous === 1) {
      this.dataForm?.document_types.push({ id: 0, name: 'Ninguno' });
      this.dataForm?.genders.push({ id: 0, name: 'No seleccionado' })
    } else {
      const filterDataForm = { ...this.dataForm };
      filterDataForm.document_types = filterDataForm?.document_types.filter(item => item.id !== 0);
      filterDataForm.genders = filterDataForm?.genders.filter(item => item.id !== 0);
      this.dataForm = filterDataForm;
    }
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-05
    * Metodo que setea el estado y valor de los campos del formulario.
    * @param anonymous Es o no anonima la peticion realizada.
  */
  changeStateAndValuesForm(anonymous: boolean): void {
    const fieldsPerson = ['document_type_id', 'num_document', 'first_name', 'second_name', 'first_last_name', 'second_last_name', 'gender_id', 'phone', 'cel_phone', 'email'];
    fieldsPerson.forEach(nameField => {
      if (anonymous) {
        this.formPqrsExternal.get(nameField)?.disable();
        this.formPqrsExternal.get(nameField)?.reset();
        this.setValuesWhenIsAnonymous();
      } else {
        this.formPqrsExternal.get(nameField)?.enable();
        this.formPqrsExternal.get(nameField)?.reset();
      }
    });
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-15
    * Metodo que setea el valor de los campos cuando es persona anonima.
  */
  setValuesWhenIsAnonymous(): void {
    const fieldsPerson = ['document_type_id', 'num_document', 'first_name', 'second_name', 'first_last_name', 'second_last_name', 'gender_id', 'phone', 'cel_phone', 'email'];
    fieldsPerson.forEach(nameField => {
      if (nameField === 'document_type_id' || nameField === 'gender_id' || nameField === 'num_document' || nameField === 'phone' || nameField === 'cel_phone') this.formPqrsExternal.get(nameField)?.setValue(0);
      else if (nameField === 'first_name' || nameField === 'second_name' || nameField === 'first_last_name' || nameField === 'second_last_name') this.formPqrsExternal.get(nameField)?.setValue('Anónimo');
      else this.formPqrsExternal.get(nameField)?.setValue('anonimo@correo.com');
    });
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-08
    * Metodo que ejecuta una alerta cuando se da clic sobre el boton de cancelar.
  */
  onClickButtonCancel(): void {
    this.alertService.showAlertConfirm({ title: '¿Está seguro?', text: '¿De cancelar el registro de la PQRS?', icon: 'question' }).then(confirm => {
      if (confirm.isConfirmed) {
        window.location.href = 'https://groupcosbpo.com/';
      }
    });
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-08
    * Metodo que precarga los valores en el formulario.
    * @param stateFieldsForm Estado de los campos del formulario. 
  */
  onLoadDataPqrs(stateFieldsForm: boolean = true): void {
    if (this.dataPqrsView !== null) {
      this.findSubIncident(this.dataPqrsView.incident_id);
      for (const key of Object.keys(this.dataPqrsView) as ValidKeys[]) {
        if (key !== 'files') {
          if (key !== 'sub_incident_id') {
            this.formPqrsExternal.get(key)?.setValue(this.dataPqrsView[key]);
            if (stateFieldsForm) this.formPqrsExternal.get(key)?.enable();
            else this.formPqrsExternal.get(key)?.disable();
          } else {
            this.formPqrsExternal.get(key)?.setValue(this.dataPqrsView[key]);
            if (stateFieldsForm && this.dataPqrsView.sub_incident) this.formPqrsExternal.get(key)?.enable();
            else this.formPqrsExternal.get(key)?.disable();
          }
        }
      }
      if (this.dataPqrsView.is_anonymous === 1) {
        const fieldsPerson = ['document_type_id', 'num_document', 'first_name', 'second_name', 'first_last_name', 'second_last_name', 'gender_id', 'phone', 'cel_phone', 'email'];
        fieldsPerson.forEach(nameField => { this.formPqrsExternal.get(nameField)?.disable(); });
      }
      this.filterDataFormValuesZero(this.dataPqrsView.is_anonymous);
      this.formPqrsExternal.get('num_document')?.disable();
      if (this.dataPqrsView.state === 'Cerrado' || this.dataPqrsView.state === 'Devuelto') {
        this.dataPqrsView.managements = [this.dataPqrsView.managements[0]];
      } else {
        this.dataPqrsView.managements = [];
      }
    }
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-12
    * Metodo que actualiza los subtipos de PQRS dependiendo la PQRS seleccionada.
    * @param $event Evento emitido por el select.  
  */
  onChangeTypePqrs($event: MatSelectChange): void {
    this.findSubIncident($event.value);
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-15
    * Metodo setea la lista de sub incidentes de acuerdo al incidente seleccionado.
    * @param value Indice seleccionado. 
  */
  findSubIncident(value: number): void {
    const filterByTypePqrs = this.dataForm?.incidents.find(item => item.id == value);
    if (filterByTypePqrs) this.subTypesPqrs = filterByTypePqrs?.sub_incidents;
    if (this.subTypesPqrs.length === 0) {
      this.formPqrsExternal.get('sub_incident_id')?.setValue(null);
      this.formPqrsExternal.get('sub_incident_id')?.setValidators([]);
      this.formPqrsExternal.get('sub_incident_id')?.updateValueAndValidity();
      this.formPqrsExternal.get('sub_incident_id')?.disable();
    } else {
      this.formPqrsExternal.get('sub_incident_id')?.setValue(null);
      this.formPqrsExternal.get('sub_incident_id')?.setValidators([Validators.required]);
      this.formPqrsExternal.get('sub_incident_id')?.updateValueAndValidity();
      this.formPqrsExternal.get('sub_incident_id')?.enable();
    }
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-16
    * Metodo que descarga un archivo seleccionado de la vista.
    * @param id ID del archivo.
    * @param type Tipo de store al cual se quiere acceder para descargar el archivo.  
  */
  downloadFile(id: number, type: string = 'pqrs-attachments'): void {
    this.pqrsService.getFile(id, type).subscribe(res => {
      importedSaveAs(res);
    });
  }
}