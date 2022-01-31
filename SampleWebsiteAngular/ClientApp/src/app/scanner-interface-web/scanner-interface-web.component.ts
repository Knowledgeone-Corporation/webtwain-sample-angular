import { Component, Input, OnInit } from '@angular/core';
import { K1WebTwain } from '../../lib/k1scanservice/js/k1ss_framework.js';
import * as $ from 'jquery'
import '../../lib/bootstrap/dist/css/bootstrap.css';
import '../../lib/k1scanservice/css/k1ss.min.css';

@Component({
  selector: 'app-scanner-interface-web',
  templateUrl: './scanner-interface-web.component.html',
})

export class ScannerInterfaceWebComponent implements OnInit {
  Render: Boolean = false;
  Response: any = null;
  ResponseString: String = "dsadsadsad";
  constructor() {

  }

  ngOnInit() {
    var self = this;
    let configuration = {
      onComplete: function (data) {
        self.Render = true;
        self.Response = data;
        self.ResponseString = JSON.stringify(data, null, 4);
      },
      viewButton: $(".k1ViewBtn"),
      fileUploadURL: document.location.origin + '/Home/UploadFile',
      clientID: "" + Date.now(),
      setupFile: document.location.origin + '/Home/DownloadSetup',
      interfacePath: "http://localhost:35497/assets/interface.html",
      scannerInterface: K1WebTwain.Options.ScannerInterface.Web,
      scanButton: $("#scanbtn"),
    };

    K1WebTwain.Configure(configuration)
      .then(x => {
        console.log(x);
      })
      .catch(x => {
        console.log(x);
      });
  }
}
