import { Component, OnInit, Input } from '@angular/core';

interface CallSumary {
  customerSentiment: string,
  keywords: string
  summaryOfConversation: string
};

@Component({
  selector: 'app-call-summary',
  templateUrl: './call-summary.component.html',
  styleUrls: ['./call-summary.component.sass']
})
export class CallSummaryComponent implements OnInit {
  @Input() dataCallSumary: CallSumary | null = null;

  constructor() { }

  ngOnInit(): void {
  
  }
}