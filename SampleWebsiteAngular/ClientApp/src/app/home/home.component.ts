import { Component } from '@angular/core';

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
