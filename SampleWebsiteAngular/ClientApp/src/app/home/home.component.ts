import { Component } from '@angular/core';
import { K1WebTwain } from '../../lib/k1scanservice/js/k1ss.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})

export class HomeComponent {
  selectedOption = -1;
  acquireResponse = '';
  acquireError = '';
  saveToType = K1WebTwain.Options.SaveToType.Upload;

  constructor() {}

  onInterfaceChange(value) {
    this.selectedOption = value;
    this.acquireResponse = ''
    this.acquireError = '';
    this.saveToType = K1WebTwain.Options.SaveToType.Upload;
  }

  completeAcquire($event) {
    this.selectedOption = -1;
    this.acquireResponse = $event.acquireResponse;
    this.acquireError = $event.acquireError;
    this.saveToType = $event.saveToType;
  }
}
