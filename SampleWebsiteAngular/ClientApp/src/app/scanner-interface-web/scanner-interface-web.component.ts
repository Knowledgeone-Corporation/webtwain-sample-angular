import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as $ from 'jquery'
import { K1WebTwain } from '../../lib/k1scanservice/js/k1ss_obfuscated.js';

@Component({
  selector: 'app-scanner-interface-web',
  templateUrl: './scanner-interface-web.component.html',
})

export class ScannerInterfaceWebComponent implements OnInit {
  @Output() completeAcquire = new EventEmitter<{acquireResponse: string, acquireError: string}>();
  
  isDisplayUI: Boolean = false;
  
  constructor() {}

  ngOnInit() {
    var self = this;
    let configuration = {
      onComplete: function (response) {
        self.completeAcquire.emit({
          acquireResponse: JSON.stringify(response.uploadResponse, null, 4),
          acquireError: '',
        });
      }, //function called when scan complete
      viewButton: null, //This is optional. Specify a element that when clicked will view scanned document
      fileUploadURL: document.location.origin + '/Home/UploadFile', //This is the service that the scanned document will be uploaded to when complete
      fileUploadHeaders: [
        {
            key: "X-Access-Token",
            value: "Test"
        }
      ], // This is optional. Specify additional headers for the request to the upload server.
      clientID: "" + Date.now(), //This is a way to identify the user who is scanning.  It should be unique per user.  Session ID could be used if no user logged in
      setupFile: document.location.origin + '/Home/DownloadSetup', //location of the installation file if service doesn't yet exist
      licenseFile: document.location.origin + '/Home/K1Licence', //location of the license file If it unset, value will fallback to Current website url + '/Home/K1Licence'
      interfacePath: document.location.origin + '/assets/interface.html', // This is optional if your application lives under a subdomain.
      scannerInterface: K1WebTwain.Options.ScannerInterface.Web,
      scanButton: $("#scanbtn"), // the scan button
    };

    K1WebTwain.Configure(configuration).then(() => {
      this.isDisplayUI = false;

      K1WebTwain.ResetService().then(function () {
          setTimeout(() => {
              self.isDisplayUI = true;
          },4000)
      });
    }).catch(err => {
        console.log(err);
        K1WebTwain.ResetService();
    });
  }
}
