import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import * as $ from "jquery";
import { K1WebTwain } from "../../lib/k1scanservice/js/k1ss.js";
import {
  convertRawOptions,
  generateScanFileName,
  getDefaultScanSettings,
  saveDefaultScanSettings,
  renderOptions,
} from "../../utils/scanningUtils";

@Component({
  selector: "app-scanner-interface-desktop",
  templateUrl: "./scanner-interface-desktop.component.html",
})
export class ScannerInterfaceDescktopComponent implements OnInit {
  @Output() completeAcquire = new EventEmitter<{
    acquireResponse: string;
    acquireError: string;
    saveToType?: number;
  }>();

  discoveredDevices: Array<any> = [];
  outputFilename: String = "";
  selectedDeviceId: any = -1;
  ocrOptions: Array<any> = [];
  selectedOcrOption: any = K1WebTwain.Options.OcrType.None;
  fileTypeOptions: Array<any> = [];
  selectedFileTypeOption: any = K1WebTwain.Options.OutputFiletype.PDF;
  isDisplayUI: Boolean = false;
  isDisableScanButton: Boolean = true;
  isDisplayScanningSection: Boolean = false;
  isDisableFinalizeSection: Boolean = true;
  isDisplayFileRestriction: Boolean = false;
  isDisplayOCR: Boolean = false;

  constructor() {}

  handleDeviceChange(deviceId: string) {
    this.selectedDeviceId = parseInt(deviceId);
    this.isDisableScanButton = parseInt(deviceId) === -1;

    let defaultSettings = getDefaultScanSettings();
    saveDefaultScanSettings(
      defaultSettings?.ScanType ?? this.selectedFileTypeOption,
      defaultSettings?.OCRType ?? this.selectedOcrOption,
      deviceId
    );
  }

  handleAcquireClick() {
    let acquireRequest = {
      deviceId: this.selectedDeviceId,
    };

    K1WebTwain.StartScan(acquireRequest)
      .then((response: { pageCount: number }) => {
        if (response.pageCount > 1) {
          this.isDisplayFileRestriction = true;
          let fileType = this.selectedFileTypeOption;
          if (
            fileType === "JPG" ||
            fileType === "GIF" ||
            fileType === "PNG" ||
            fileType === "BMP"
          ) {
            this.selectedFileTypeOption =
              K1WebTwain.Options.OutputFiletype.TIFF;
          }

          this.fileTypeOptions = this.fileTypeOptions.filter(
            (fileType) =>
              fileType.value === "PDF" ||
              fileType.value === "PDF/A" ||
              fileType.value === "TIF"
          );
        } else {
          this.isDisplayFileRestriction = false;
          let mappedFileTypeOptions = convertRawOptions(
            K1WebTwain.Options.OutputFiletype,
            true
          );
          this.fileTypeOptions = renderOptions(mappedFileTypeOptions);
        }

        this.isDisableFinalizeSection = false;
        this.isDisableScanButton = true;
      })
      .catch((err) => {
        this.handleError(err);
      });
  }

  ngOnInit() {
    let self = this;
    let configuration = {
      onComplete: function () {}, //function called when scan complete
      viewButton: null, //This is optional. Specify a element that when clicked will view scanned document
      fileUploadURL: document.location.origin + "/Home/UploadFile", //This is the service that the scanned document will be uploaded to when complete
      fileUploadHeaders: [
        {
          key: "X-Access-Token",
          value: "Test",
        },
      ], // This is optional. Specify additional headers for the request to the upload server.
      clientID: "" + Date.now(), //This is a way to identify the user who is scanning.  It should be unique per user.  Session ID could be used if no user logged in
      setupFile: document.location.origin + "/Home/DownloadSetup", //location of the installation file if service doesn't yet exist
      licenseFile: document.location.origin + "/Home/K1Licence", //location of the license file If it unset, value will fallback to Current website url + '/Home/K1Licence'
      interfacePath: document.location.origin + "/assets/interface.html", // This is optional if your application lives under a subdomain.
      scannerInterface: K1WebTwain.Options.ScannerInterface.Desktop,
      scanButton: $("#scanbtn"), // the scan button
    };

    K1WebTwain.Configure(configuration)
      .then(() => {
        this.isDisplayUI = false;

        K1WebTwain.ResetService().then(function () {
          //setTimeout(() => {
          self.isDisplayUI = true;
          //},4000)
        });
      })
      .catch((err) => {
        console.log(err);
        K1WebTwain.ResetService();
      });
  }

  renderSelection() {
    K1WebTwain.GetDevices()
      .then((devices: any[]) => {
        let mappedDevices = devices.map((device) => ({
          value: device.id,
          display: device.name,
        }));

        let mappedOcrTypes = convertRawOptions(
          K1WebTwain.Options.OcrType,
          true
        );

        let mappedFileTypeOptions = convertRawOptions(
          K1WebTwain.Options.OutputFiletype,
          true
        );

        this.ocrOptions = renderOptions(mappedOcrTypes);
        this.fileTypeOptions = renderOptions(mappedFileTypeOptions);
        this.discoveredDevices = renderOptions(mappedDevices);
        this.outputFilename = generateScanFileName();
        this.isDisplayScanningSection = true;

        let scanSettings = getDefaultScanSettings();
        if (scanSettings) {
          this.selectedFileTypeOption = scanSettings.ScanType;
          this.selectedOcrOption = scanSettings.UseOCR
            ? scanSettings.OCRType
            : K1WebTwain.Options.OcrType.None;
          this.handleDeviceChange(scanSettings.ScanSource);
        }

        this.isDisplayOCR =
          this.selectedFileTypeOption ===
            K1WebTwain.Options.OutputFiletype.PDF ||
          this.selectedFileTypeOption ===
            K1WebTwain.Options.OutputFiletype["PDF/A"];
      })
      .catch((err) => {
        console.error(err);
      });
  }

  handleFileTypeChange(outputType: any) {
    this.selectedFileTypeOption = outputType;
    this.isDisplayOCR =
      outputType === K1WebTwain.Options.OutputFiletype.PDF ||
      outputType === K1WebTwain.Options.OutputFiletype["PDF/A"];
    let defaultSettings = getDefaultScanSettings();
    saveDefaultScanSettings(
      outputType,
      defaultSettings?.OCRType ?? this.selectedOcrOption,
      defaultSettings?.ScanSource ?? this.selectedDeviceId
    );
  }

  handlOcrTypeChange(ocrType: any) {
    this.selectedOcrOption = ocrType;
    let defaultSettings = getDefaultScanSettings();
    saveDefaultScanSettings(
      defaultSettings?.ScanType ?? this.selectedFileTypeOption,
      ocrType,
      defaultSettings?.ScanSource ?? this.selectedDeviceId
    );
  }

  handleCancelFinalization(e) {
    K1WebTwain.ClearAllScannedPages()
      .then(() => {
        this.isDisableFinalizeSection = true;
        this.isDisableScanButton = false;
      })
      .catch((err) => {
        this.handleError(err);
      });
  }

  handleAttachDocument(e) {
    K1WebTwain.ValidatePageSize({
      ocrType: this.selectedOcrOption,
      fileType: this.selectedFileTypeOption,
      saveToType: K1WebTwain.Options.SaveToType.Upload,
      generateDocument: () => {
        this.generateDocument(K1WebTwain.Options.SaveToType.Upload);
      },
    });
  }

  handleSaveDocument(e) {
    K1WebTwain.ValidatePageSize({
      ocrType: this.selectedOcrOption,
      fileType: this.selectedFileTypeOption,
      saveToType: K1WebTwain.Options.SaveToType.Local,
      generateDocument: () => {
        this.generateDocument(K1WebTwain.Options.SaveToType.Local);
      },
    });
  }

  generateDocument(saveToType) {
    K1WebTwain.GenerateDocument({
      filetype: this.selectedFileTypeOption,
      ocrType: this.selectedOcrOption,
      saveToType: saveToType,
      filename: this.outputFilename,
    })
      .then((response) => {
        let responseMessage = response.uploadResponse;
        if (saveToType === K1WebTwain.Options.SaveToType.Local) {
          responseMessage = {
            filename: response.filename,
            fileSize: `${response.fileLength} (${response.sizeDisplay})`,
            fileExtension: response.extension,
          };
        }
        this.completeAcquire.emit({
          acquireResponse: JSON.stringify(responseMessage, null, 4),
          acquireError: "",
          saveToType: saveToType,
        });
      })
      .catch((err) => {
        this.handleError(err);
      });
  }

  handleError(err: {
    responseText: any;
    responseJSON: any;
    statusText: string;
  }) {
    if (err) {
      if (!!err.responseText) {
        this.completeAcquire.emit({
          acquireResponse: "",
          acquireError: err.responseText,
        });
      }

      if (!!err.responseJSON) {
        try {
          this.completeAcquire.emit({
            acquireResponse: "",
            acquireError: JSON.stringify(err.responseJSON, null, 4),
          });
        } catch (e) {
          console.warn(e);
        }
      }

      if (err.statusText && err.statusText === "timeout") {
        this.completeAcquire.emit({
          acquireResponse: "",
          acquireError:
            "Timeout error while processing/uploading scanned documents.",
        });
      }
    }
  }
}
