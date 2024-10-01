import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Management } from 'src/app/interfaces-types/search-pqrs.interface';

@Component({
  selector: 'app-management-history',
  templateUrl: './management-history.component.html',
  styleUrls: ['./management-history.component.css']
})
export class ManagementHistoryComponent implements OnInit {
  @Input() managments: Management[] = [];
  @Input() statePqrs: string = '';
  @Output() sendFileManagment: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {

  }
}