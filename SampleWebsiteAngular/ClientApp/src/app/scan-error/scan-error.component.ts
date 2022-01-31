import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scan-error',
  templateUrl: './scan-error.component.html',
})

export class ScanErrorComponent {
  @Input() message: String
  constructor() { }
}
