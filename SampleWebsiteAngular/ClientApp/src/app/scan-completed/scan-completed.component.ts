import { Component, Input } from '@angular/core';
import { K1WebTwain } from '../../lib/k1scanservice/js/k1ss_obfuscated.js';

@Component({
  selector: 'app-scan-completed',
  templateUrl: './scan-completed.component.html',
})

export class ScanCompletedComponent {
  @Input() message: String
  constructor() { }

  downloadDocument() {
    K1WebTwain.SPADownloadDocument();
  }
}
