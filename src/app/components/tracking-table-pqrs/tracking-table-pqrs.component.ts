import { Component, OnInit } from '@angular/core';
import { ConfigTable, AdditionalExternalData } from 'src/app/interfaces-types/search-pqrs.interface';
import { MatDialog } from '@angular/material/dialog';
import { ViewPqrsComponent } from '../view-pqrs/view-pqrs.component';
import { PqrsService } from '../../services/pqrs.service';

@Component({
  selector: 'app-tracking-table-pqrs',
  templateUrl: './tracking-table-pqrs.component.html',
  styleUrls: ['./tracking-table-pqrs.component.css']
})
export class TrackingTablePqrsComponent implements OnInit {
  filingNumber!: number | null;
  securityCode!: string | null;
  configColumnsTable: ConfigTable[] = [
    { name: 'Tipo de PQRS', key: 'text_incident' },
    { name: 'Subtipo de PQRS', key: 'text_sub_incident' },
    { name: 'Fecha de radicación', key: 'created_at' },
    { name: 'Estado', key: 'state' },
    { name: '', key: 'actions' },
  ];
  keysColumnsTable: string[] = [];
  listPqrs: AdditionalExternalData[] = [];

  constructor(
    private matDialog: MatDialog,
    private pqrsService: PqrsService
  ) { }

  ngOnInit(): void {
    this.keysColumnsTable = this.configColumnsTable.map(item => item.key);
  }
  
  /**
    * @author Fabian Duran
    * @createdate 2024-04-08
    * Metodo que ejecuta la modal para vizualizar la PQRS seleccionada en la tabla.
    * @param pqrs PQRS seleccionada.
  */
  onClickButtonShow(pqrs: AdditionalExternalData): void {    
    this.matDialog.open(ViewPqrsComponent, {
      autoFocus: false,
      width: '60%',
      data: {
        pqrs
      }
    }).afterClosed().subscribe(res => {
      if (res) {
        this.filingNumber = null;
        this.securityCode = null;
        this.listPqrs = [];
      }
    });
  }
  /**
    * @author Fabian Duran
    * @createdate 2024-04-15
    * Metodo que setea los datos sobre la tabla.
  */
  onClickSearchPqrsExternal(): void {
    this.pqrsService.searchPqrsExternal({ pqrsId: this.filingNumber, verificationCode: this.securityCode }).subscribe(res => {
      this.listPqrs = res;
    });
  }
}