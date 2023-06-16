import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as $ from 'jquery'
import { isEmpty } from 'lodash';
import { K1WebTwain } from '../../lib/k1scanservice/js/k1ss_obfuscated.js';
import { convertRawOptions, defaultOptionsValue, generateScanFileName, renderOptions } from '../../utils/scanningUtils';

@Component({
  selector: 'app-scanner-interface-hidden',
  templateUrl: './scanner-interface-hidden.component.html',
})

export class ScannerInterfaceHiddenComponent implements OnInit {  
  @Output() completeAcquire = new EventEmitter<{acquireResponse: string, acquireError: string}>();

  discoveredDevices: Array<any> = [];
  selectedDevice: any = {};
  documentSourceOptions: Array<any> = [];
  selectedDocumentSource: any = 0;
  duplexOptions: Array<any> = [];
  selectedDuplexOption: any = 0;
  pageSizeOptions: Array<any> = [];
  selectedPageSizeOption: any = 0;
  pixelTypeOptions: Array<any> = [];
  selectedPixelTypeOption: any = 0;
  resolutionOptions: Array<any> = [];
  selectedResolutionOption: any = 0;
  ocrOptions: Array<any> = [];
  selectedOcrOption: any = K1WebTwain.Options.OcrType.None;
  fileTypeOptions: Array<any> = [];
  selectedFileTypeOption: any = K1WebTwain.Options.OutputFiletype.PDF;
  outputFilename: String = '';
  isDisplayUI: Boolean = false;

  constructor() {}

  onDeviceChange(deviceId) {
    K1WebTwain.Device(deviceId).then(deviceInfo => {
      if(!isEmpty(deviceInfo)) {
          let documentSourceOptions = Object.keys(deviceInfo.documentSourceIds).map((key) => {
              return { value: key, display: deviceInfo.documentSourceIds[key].name };
          });

          this.selectedDevice = deviceInfo;
          this.selectedDocumentSource = defaultOptionsValue(documentSourceOptions);
          this.duplexOptions = [];
          this.pageSizeOptions = [];
          this.pixelTypeOptions = [];
          this.resolutionOptions = [];
          this.documentSourceOptions = renderOptions(documentSourceOptions);

          this.onDocumentSourceChange(defaultOptionsValue(documentSourceOptions));
      }
    }).catch(err => {
        console.log(err);
        this.selectedDevice = {};
        this.selectedDocumentSource = 0;
        this.duplexOptions = [];
        this.pageSizeOptions = [];
        this.pixelTypeOptions = [];
        this.resolutionOptions = [];
        this.documentSourceOptions = [];
    })
  }

  onDocumentSourceChange(documentSourceId) {
    let selectedDocumentSource = this.selectedDevice.documentSourceIds[documentSourceId];

    let duplexOptions = [],
        pageSizeOptions = [],
        pixelTypeOptions = [],
        resolutionOptions = [];

    if (!!selectedDocumentSource) {
        duplexOptions = convertRawOptions(selectedDocumentSource.duplexIds);
        pageSizeOptions = convertRawOptions(selectedDocumentSource.pageSizeIds);
        pixelTypeOptions = convertRawOptions(selectedDocumentSource.pixelTypeIds);
        resolutionOptions = convertRawOptions(selectedDocumentSource.resolutionIds);
    } else {
        selectedDocumentSource = null;
    }

    this.selectedDuplexOption = defaultOptionsValue(duplexOptions);
    this.selectedPageSizeOption = defaultOptionsValue(pageSizeOptions);
    this.selectedPixelTypeOption = defaultOptionsValue(pixelTypeOptions);
    this.selectedResolutionOption = defaultOptionsValue(resolutionOptions);
    this.selectedDocumentSource = documentSourceId;
    this.duplexOptions = renderOptions(duplexOptions);
    this.pageSizeOptions = renderOptions(pageSizeOptions);
    this.pixelTypeOptions = renderOptions(pixelTypeOptions);
    this.resolutionOptions = renderOptions(resolutionOptions);
  }

  onClick() {
    this.isDisplayUI = false;

    let acquireRequest = {
      deviceId: this.selectedDevice.id,
      resolutionId: this.selectedResolutionOption,
      pixelTypeId: this.selectedPixelTypeOption,
      pageSizeId: this.selectedPageSizeOption,
      documentSourceId: this.selectedDocumentSource,
      duplexId: this.selectedDuplexOption,
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
      clientID: "" + Date.now(), //This is a way to identify the user who is scanning.  It should be unique per user.  Session ID could be used if no user logged in
      setupFile: document.location.origin + '/Home/DownloadSetup', //location of the installation file if service doesn't yet exist
      interfacePath: document.location.origin + '/assets/interface.html', // This is optional if your application lives under a subdomain.
      scannerInterface: K1WebTwain.Options.ScannerInterface.Hidden,
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

        this.onDeviceChange(defaultOptionsValue(mappedDevices));
    }).catch(err => {
        console.error(err);
    });
  }
}
