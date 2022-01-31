import { Component, OnInit } from '@angular/core';
import { K1WebTwain } from '../../lib/k1scanservice/js/k1ss_framework.js';
import * as $ from 'jquery'
import '../../lib/bootstrap/dist/css/bootstrap.css';
import '../../lib/k1scanservice/css/k1ss.min.css';

@Component({
  selector: 'app-scanner-interface-hidden',
  templateUrl: './scanner-interface-hidden.component.html',
})

export class ScannerInterfaceHiddenComponent implements OnInit {
  discoveredDevices: Array<any> = [];
  selectedDevice: any = null;
  documentSourceOptions: Array<any> = [];
  selectedDocumentSource: any = null;
  duplexOptions: Array<any> = [];
  selectedDuplexOption: any = -1;
  pageSizeOptions: Array<any> = [];
  selectedPageSizeOption: any = -1;
  pixelTypeOptions: Array<any> = [];
  selectedPixelTypeOption: any = -1;
  resolutionOptions: Array<any> = [];
  selectedResolutionOption: any = -1;
  ocrOptions: Array<any> = [];
  selectedOcrOption: any = -1;
  fileTypeOptions: Array<any> = [];
  selectedFileTypeOption: any = -1;
  outputFilename: string = "";
  acquireResponse: any = null;
  acquireResponseString: any = null;
  acquireError: any = null;

  constructor() {

  }

  onDeviceChange(e) {
    console.log(e);
    let device = K1WebTwain.Device(e.target.value);
    console.log(device);
    let documentSourceOptions = [];

    if (device !== null) {
      documentSourceOptions = Object.keys(device.documentSourceIds).map((key) => {
        return { value: key, display: device.documentSourceIds[key].name };
      });

      if (documentSourceOptions.length > 0) {
        documentSourceOptions = [{ value: -1, display: "Please Select" }].concat(documentSourceOptions)
      }
    }

    this.selectedDevice = device;
    this.selectedDocumentSource = null;
    this.duplexOptions = [];
    this.pageSizeOptions = [];
    this.pixelTypeOptions = [];
    this.resolutionOptions = [];
    this.documentSourceOptions = documentSourceOptions;
  }

  onDocumentSourceChange(e) {
    let selectedDocumentSource = this.selectedDevice.documentSourceIds[e.target.value];

    let duplexOptions = [],
      pageSizeOptions = [],
      pixelTypeOptions = [],
      resolutionOptions = [];

    if (!!selectedDocumentSource) {
      duplexOptions = Object.keys(selectedDocumentSource.duplexIds).map((key) => {
        return { value: key, display: selectedDocumentSource.duplexIds[key] };
      });

      if (duplexOptions.length > 0) {
        duplexOptions = [{ value: -1, display: "Please Select" }].concat(duplexOptions)
      }

      pageSizeOptions = Object.keys(selectedDocumentSource.pageSizeIds).map((key) => {
        return { value: key, display: selectedDocumentSource.pageSizeIds[key] };
      });

      if (pageSizeOptions.length > 0) {
        pageSizeOptions = [{ value: -1, display: "Please Select" }].concat(pageSizeOptions)
      }

      pixelTypeOptions = Object.keys(selectedDocumentSource.pixelTypeIds).map((key) => {
        return { value: key, display: selectedDocumentSource.pixelTypeIds[key] };
      });

      if (pixelTypeOptions.length > 0) {
        pixelTypeOptions = [{ value: -1, display: "Please Select" }].concat(pixelTypeOptions)
      }

      resolutionOptions = Object.keys(selectedDocumentSource.resolutionIds).map((key) => {
        return { value: key, display: selectedDocumentSource.resolutionIds[key] };
      });

      if (resolutionOptions.length > 0) {
        resolutionOptions = [{ value: -1, display: "Please Select" }].concat(resolutionOptions)
      }
    }
    else {
      selectedDocumentSource = null;
    }

    console.log(selectedDocumentSource);

    this.selectedDuplexOption = -1;
    this.selectedPageSizeOption = -1;
    this.selectedPixelTypeOption = -1;
    this.selectedResolutionOption = -1;
    this.selectedDocumentSource = selectedDocumentSource;
    this.duplexOptions = duplexOptions;
    this.pageSizeOptions = pageSizeOptions;
    this.pixelTypeOptions = pixelTypeOptions;
    this.resolutionOptions = resolutionOptions;
  }


  onClick() {
    this.acquireResponse = null;
    this.acquireError = null;

    let acquireRequest = {
      deviceId: this.selectedDevice.id,
      resolutionId: this.selectedResolutionOption,
      pixelTypeId: this.selectedPixelTypeOption,
      pageSizeId: this.selectedPageSizeOption,
      documentSourceId: this.selectedDocumentSource.id,
      duplexId: this.selectedDuplexOption,
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
      scannerInterface: K1WebTwain.Options.ScannerInterface.Hidden,
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
            this.discoveredDevices = [{ value: -1, display: "Please Select" }].concat(mappedDevices);
          })
          .catch(ex => { });
      })
      .catch(x => {
        console.log(x);
      });
  }
}
