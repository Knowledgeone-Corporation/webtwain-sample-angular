import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scan-completed',
  templateUrl: './scan-completed.component.html',
})

export class ScanCompletedComponent {
  @Input() message: String
  constructor() { }
}
