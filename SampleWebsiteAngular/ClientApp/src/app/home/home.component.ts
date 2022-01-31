import { Component } from '@angular/core';
import '../../lib/bootstrap/dist/css/bootstrap.css';
import '../../lib/k1scanservice/css/k1ss.min.css';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})

export class HomeComponent {
  selectedOption = -1;
  constructor() {

  }

  onInterfaceChange(value) {
    this.selectedOption = value;
    console.log(this.selectedOption);
  }
}
