import { Component, OnInit } from '@angular/core';
import { K1WebTwain } from '../../lib/k1scanservice/js/k1ss_framework.js';
import * as $ from 'jquery'
import '../../lib/bootstrap/dist/css/bootstrap.css';
import '../../lib/k1scanservice/css/k1ss.min.css';

@Component({
  selector: 'app-scanner-interface-desktop',
  templateUrl: './scanner-interface-desktop.component.html',
})

export class ScannerInterfaceDescktopComponent implements OnInit {
  allDevices: Array<any>;
  outputFilename: String = "";
  selectedScanner: any = -1;
  ocrOptions: Array<any>;
  selectedOcrOption: any = -1;
  fileTypeOptions: Array<any>;
  selectedFileTypeOption: any = -1;
  acquireResponse: any = null;
  acquireResponseString: any = null;
  acquireError: any = null;

  constructor() {

  }

  onClick() {
    this.acquireResponse = null;
    this.acquireError = null;

    let acquireRequest = {
      deviceId: this.selectedScanner,
      filetype: this.selectedFileTypeOption,
      ocrType: this.selectedOcrOption,
      filename: this.outputFilename,
    };

    console.log(acquireRequest);

    K1WebTwain.Acquire(acquireRequest)
      .then(response => {
        console.log(response);
        this.acquireResponse = response;
        this.acquireResponseString = JSON.stringify(response, null, 4);
      })
      .catch(err => {
        console.error(err);
        let myError = null;

        if (!!err.responseText) {
          myError = err.responseText;
        }

        if (!!err.responseJSON) {
          try {
            myError = JSON.stringify(err.responseJSON, null, 4);
          }
          catch (e) {
            console.warn(e);
          }
        }

        this.acquireError = myError;
      });
  }

  ngOnInit() {
    var self = this;
    let configuration = {
      onComplete: function (data) { },
      viewButton: $(".k1ViewBtn"),
      fileUploadURL: document.location.origin + '/Home/UploadFile',
      clientID: "" + Date.now(),
      setupFile: document.location.origin + '/Home/DownloadSetup',
      interfacePath: "http://localhost:35497/assets/interface.html",
      scannerInterface: K1WebTwain.Options.ScannerInterface.Desktop,
      scanButton: $("#scanbtn"),
    };

    K1WebTwain.Configure(configuration)
      .then(x => {
        K1WebTwain.GetDevices()
          .then(devices => {
            let mappedDevices = devices.map(device => {
              return { value: device.id, display: device.name };
            });

            let mappedOcrTypes = Object.keys(K1WebTwain.Options.OcrType).map((key) => {
              return { value: K1WebTwain.Options.OcrType[key], display: key };
            });

            let mappedFileTypeOptions = Object.keys(K1WebTwain.Options.OutputFiletype).map((key) => {
              return { value: K1WebTwain.Options.OutputFiletype[key], display: key };
            });

            this.ocrOptions = [{ value: -1, display: "Please Select" }].concat(mappedOcrTypes);
            this.fileTypeOptions = [{ value: -1, display: "Please Select" }].concat(mappedFileTypeOptions);
            this.allDevices = [{ value: -1, display: "Please Select" }].concat(mappedDevices);
          })
          .catch(ex => { });
      })
      .catch(x => {
        console.log(x);
      });
  }
}
