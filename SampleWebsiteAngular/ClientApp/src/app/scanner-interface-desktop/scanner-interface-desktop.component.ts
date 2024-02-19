import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as $ from 'jquery'
import { K1WebTwain } from '../../lib/k1scanservice/js/k1ss.js';
import { convertRawOptions, generateScanFileName, renderOptions } from '../../utils/scanningUtils';

@Component({
  selector: 'app-scanner-interface-desktop',
  templateUrl: './scanner-interface-desktop.component.html',
})

export class ScannerInterfaceDescktopComponent implements OnInit {
  @Output() completeAcquire = new EventEmitter<{ acquireResponse: string, acquireError: string, saveToType?: number}>();

  discoveredDevices: Array<any> = [];
  outputFilename: String = '';
  selectedScanner: any = 0;
  ocrOptions: Array<any> = [];
  selectedOcrOption: any = K1WebTwain.Options.OcrType.None;
  saveToTypeOptions: Array<any> = [];
  selectedSaveToOption: any =  K1WebTwain.Options.SaveToType.Upload;
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
      saveToType: this.selectedSaveToOption,
    };

    K1WebTwain.Acquire(acquireRequest)
      .then(response => {
        let responseMessage = response.uploadResponse;

        if (this.selectedSaveToOption === K1WebTwain.Options.SaveToType.Local) {
          responseMessage = {
            filename: response.filename,
            fileSize: `${response.fileLength} (${response.sizeDisplay})`,
            fileExtension: response.extension
          };
        }

        this.completeAcquire.emit({
          acquireResponse: JSON.stringify(responseMessage, null, 4),
          acquireError: '',
          saveToType: this.selectedSaveToOption
        });
      })
      .catch(err => {
        if(err) {
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

          if (err.statusText && err.statusText === 'timeout') {
            this.completeAcquire.emit({
              acquireResponse: '',
              acquireError: 'Timeout error while processing/uploading scanned documents.',
            });
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
        let mappedSaveToTypeOptions = convertRawOptions(K1WebTwain.Options.SaveToType, true);

        this.ocrOptions = renderOptions(mappedOcrTypes);
        this.fileTypeOptions = renderOptions(mappedFileTypeOptions);
        this.discoveredDevices = renderOptions(mappedDevices);
        this.saveToTypeOptions = renderOptions(mappedSaveToTypeOptions);
        this.outputFilename = generateScanFileName();
    }).catch(err => {
        console.error(err);
    });
  }

  onSaveToTypeChange(value: string) {
    this.selectedSaveToOption = parseInt(value);
  }
}
