import { Component, Input, OnInit } from '@angular/core';
import { K1WebTwain } from '../../lib/k1scanservice/js/k1ss.js';

@Component({
  selector: 'app-scan-completed',
  templateUrl: './scan-completed.component.html',
})

export class ScanCompletedComponent implements OnInit {  
  @Input() message: String
  @Input() saveToType: Number
  isSaveLocally = false;
  constructor() {}

  ngOnInit() {
    this.isSaveLocally = this.saveToType == K1WebTwain.Options.SaveToType.Local;
  }

  downloadDocument() {
    K1WebTwain.SPADownloadDocument();
  }
}
