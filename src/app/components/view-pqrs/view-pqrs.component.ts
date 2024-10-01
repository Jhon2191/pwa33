import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataDialogPqrs } from 'src/app/interfaces-types/search-pqrs.interface';

@Component({
  selector: 'app-view-pqrs',
  templateUrl: './view-pqrs.component.html',
  styleUrls: ['./view-pqrs.component.css']
})
export class ViewPqrsComponent implements OnInit {
  disabledFields: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DataDialogPqrs,
    private matDialogRef: MatDialogRef<ViewPqrsComponent>
  ) { }

  ngOnInit(): void {
    
  }

  /**
    * @author Fabian Duran
    * @createdate 2024-04-24
    * Metodo que retorna el titulo de la modal.
  */
  get titleDialog(): string {
    return this.disabledFields ? `Ver PQRS N° ${this.data.pqrs.pqrs_id}` : `Editar PQRS N° ${this.data.pqrs.pqrs_id}`;
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-17
    * Metodo que cierra la modal cuando se realiza una gestion sobre el formulario.
  */
  onCloseDialog(): void {
    this.matDialogRef.close(true);
  }
}