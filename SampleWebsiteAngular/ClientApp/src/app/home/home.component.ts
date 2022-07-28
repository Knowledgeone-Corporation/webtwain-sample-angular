import { Component } from '@angular/core';
import '../../lib/bootstrap/dist/css/bootstrap.css';
import '../../lib/k1scanservice/css/k1ss.min.css';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})

export class HomeComponent {
  selectedOption = -1;
  acquireResponse = '';
  acquireError = '';

  constructor() {}

  onInterfaceChange(value) {
    this.selectedOption = value;
    this.acquireResponse = ''
    this.acquireError = '';
  }

  completeAcquire($event) {
    this.selectedOption = -1;
    this.acquireResponse = $event.acquireResponse;
    this.acquireError = $event.acquireError;
  }
}
