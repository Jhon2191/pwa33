import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-svg-feelings',
  templateUrl: './svg-feelings.component.html',
  styleUrls: ['./svg-feelings.component.sass']
})
export class SvgFeelingsComponent implements OnInit {
  @Input() faceType: string | null = null;

  constructor() { }

  ngOnInit(): void {
  
  }
}