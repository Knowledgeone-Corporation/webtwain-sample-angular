import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as $ from 'jquery'
import { K1WebTwain } from '../../lib/k1scanservice/js/k1ss_obfuscated.js';
import { convertRawOptions, generateScanFileName, renderOptions } from '../../utils/scanningUtils';

import '../../lib/bootstrap/dist/css/bootstrap.css';
import '../../lib/k1scanservice/css/k1ss.min.css';

@Component({
  selector: 'app-scanner-interface-desktop',
  templateUrl: './scanner-interface-desktop.component.html',
})

export class ScannerInterfaceDescktopComponent implements OnInit {
  @Output() completeAcquire = new EventEmitter<{acquireResponse: string, acquireError: string}>();

  discoveredDevices: Array<any> = [];
  outputFilename: String = '';
  selectedScanner: any = 0;
  ocrOptions: Array<any> = [];
  selectedOcrOption: any = K1WebTwain.Options.OcrType.None;
  fileTypeOptions: Array<any> = [];
  selectedFileTypeOption: any = K1WebTwain.Options.OutputFiletype.PDF;
  isDisplayUI: Boolean = false;

  constructor() {}

  onClick() {
    this.isDisplayUI = false;

    let acquireRequest = {
      deviceId: this.selectedScanner,
      filetype: this.selectedFileTypeOption,
      ocrType: this.selectedOcrOption,
      filename: this.outputFilename,
    };

    K1WebTwain.Acquire(acquireRequest)
      .then(response => {
        this.completeAcquire.emit({
          acquireResponse: JSON.stringify(response.uploadResponse, null, 4),
          acquireError: '',
        });
      })
      .catch(err => {
        console.error(err);
        if (!!err.responseText) {
          this.completeAcquire.emit({
            acquireResponse: '',
            acquireError: err.responseText,
          });
        }

        if (!!err.responseJSON) {
          try {
            this.completeAcquire.emit({
              acquireResponse: '',
              acquireError: JSON.stringify(err.responseJSON, null, 4),
            });
          } catch (e) {
              console.warn(e);
          }
        }
      });
  }

  ngOnInit() {
    let self = this;
    let configuration = {
      onComplete: function () { }, //function called when scan complete
      viewButton: null, //This is optional. Specify a element that when clicked will view scanned document
      fileUploadURL: document.location.origin + '/Home/UploadFile', //This is the service that the scanned document will be uploaded to when complete
      clientID: "" + Date.now(), //This is a way to identify the user who is scanning.  It should be unique per user.  Session ID could be used if no user logged in
      setupFile: document.location.origin + '/Home/DownloadSetup', //location of the installation file if service doesn't yet exist
      interfacePath: document.location.origin + '/assets/interface.html', // This is optional if your application lives under a subdomain.
      scannerInterface: K1WebTwain.Options.ScannerInterface.Desktop,
      scanButton: $("#scanbtn"), // the scan button
    };

    K1WebTwain.Configure(configuration).then(() => {
      this.isDisplayUI = false;

      K1WebTwain.ResetService().then(function () {
          setTimeout(() => {
              self.renderSelection();
              self.isDisplayUI = true;
          },4000)
      });
    }).catch(err => {
        console.log(err);
        K1WebTwain.ResetService();
    });
  }

  renderSelection() {
    K1WebTwain.GetDevices().then(devices => {
        let mappedDevices = devices.map(device => ({ value: device.id, display: device.name }));
        let mappedOcrTypes = convertRawOptions(K1WebTwain.Options.OcrType, true);
        let mappedFileTypeOptions = convertRawOptions(K1WebTwain.Options.OutputFiletype, true);

        this.ocrOptions = renderOptions(mappedOcrTypes);
        this.fileTypeOptions = renderOptions(mappedFileTypeOptions);
        this.discoveredDevices = renderOptions(mappedDevices);
        this.outputFilename = generateScanFileName();
    }).catch(err => {
        console.error(err);
    });
  }
}
