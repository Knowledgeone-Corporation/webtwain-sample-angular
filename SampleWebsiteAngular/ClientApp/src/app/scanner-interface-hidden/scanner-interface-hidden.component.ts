import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import * as $ from "jquery";
import { isEmpty } from "lodash";
import { K1WebTwain } from "../../lib/k1scanservice/js/k1ss.js";
import {
  convertRawOptions,
  defaultOptionsValue,
  getDefaultScanSettings,
  getScannerDetails,
  saveDefaultScanSettings,
  generateScanFileName,
  renderOptions,
} from "../../utils/scanningUtils";

@Component({
  selector: "app-scanner-interface-hidden",
  templateUrl: "./scanner-interface-hidden.component.html",
})

export class ScannerInterfaceHiddenComponent implements OnInit {
  @Output() completeAcquire = new EventEmitter<{
    acquireResponse: string;
    acquireError: string;
    saveToType?: number;
  }>();

  discoveredDevices: Array<any> = [];
  selectedDeviceInfo: any = {};
  selectedDeviceId: any = -1;
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
  outputFilename: String = "";
  isDisplayUI: Boolean = false;
  isDisableScanButton: Boolean = true;
  isDisplayScanningSection: Boolean = false;
  isDisableFinalizeSection: Boolean = true;
  isDisplayOCR: Boolean = false;
  compressionOptions: Array<any> = [];
  selectedCompressionOption: any = "0";

  constructor() {}

  handleDeviceChange(deviceId: any) {
    K1WebTwain.Device(deviceId)
      .then((deviceInfo) => {
        let defaultSettings = getDefaultScanSettings();
        debugger

        if (!isEmpty(deviceInfo)) {
          let documentSourceOptions = Object.keys(
            deviceInfo.documentSourceIds
          ).map((key) => {
            return {
              value: key,
              display: deviceInfo.documentSourceIds[key].name,
            };
          });

          const defaultDocumentSource = defaultSettings?.ScannerDetails?.DocumentSource ?? defaultOptionsValue(documentSourceOptions);

          this.setDeviceInfo(deviceInfo);
          this.selectedDocumentSource = defaultDocumentSource;
          this.duplexOptions = [];
          this.pageSizeOptions = [];
          this.pixelTypeOptions = [];
          this.resolutionOptions = [];
          this.documentSourceOptions = renderOptions(documentSourceOptions);
          this.isDisableScanButton = false;
          this.handleDocumentSourceChange(defaultDocumentSource);
        } else {
          this.setDeviceInfo(this.discoveredDevices[0]);
          this.duplexOptions = [];
          this.pageSizeOptions = [];
          this.pixelTypeOptions = [];
          this.resolutionOptions = [];
          this.documentSourceOptions = [];
          this.isDisableScanButton = true;
        }

        let scannerDetails = getScannerDetails(defaultSettings);
        scannerDetails.ScanSource = deviceId;
        this.saveDefaultScannerDetails(defaultSettings, scannerDetails);
      })
      .catch((err) => {
        console.log(err);
        this.setDeviceInfo({});
        this.selectedDocumentSource = 0;
        this.duplexOptions = [];
        this.pageSizeOptions = [];
        this.pixelTypeOptions = [];
        this.resolutionOptions = [];
        this.documentSourceOptions = [];
        this.isDisableScanButton = true;
      });
  }

  saveDefaultScannerDetails(defaultSettings, scannerDetails) {
    saveDefaultScanSettings(
      defaultSettings?.ScanType ?? this.selectedFileTypeOption,
      defaultSettings?.OCRType ?? this.selectedOcrOption,
      scannerDetails,
      this.selectedCompressionOption
    );
  }

  setDeviceInfo(deviceInfo) {
    this.selectedDeviceInfo = deviceInfo;
    this.selectedDeviceId = deviceInfo?.id ?? deviceInfo?.value ?? -1;
  }

  handleDocumentSourceChange(documentSourceId: string | number) {
    let defaultSettings = getDefaultScanSettings();
    let scannerDetails = getScannerDetails(defaultSettings);

    let selectedDocumentSource =
      this.selectedDeviceInfo.documentSourceIds[documentSourceId];

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

    this.selectedDuplexOption = scannerDetails?.Duplex ?? defaultOptionsValue(duplexOptions);
    console.log(this.selectedDuplexOption);
    this.selectedPageSizeOption = scannerDetails?.PageSize ?? defaultOptionsValue(pageSizeOptions);
    this.selectedPixelTypeOption = scannerDetails?.Color ?? defaultOptionsValue(pixelTypeOptions);
    this.selectedResolutionOption = scannerDetails?.Resolution ?? defaultOptionsValue(resolutionOptions);
    this.selectedDocumentSource = documentSourceId;
    this.duplexOptions = renderOptions(duplexOptions);
    this.pageSizeOptions = renderOptions(pageSizeOptions);
    this.pixelTypeOptions = renderOptions(pixelTypeOptions);
    this.resolutionOptions = renderOptions(resolutionOptions);

    scannerDetails.DocumentSource = documentSourceId;

    this.saveDefaultScannerDetails(defaultSettings, scannerDetails);
  }

  handleResolutionChange(selectedResolution) {
    this.selectedResolutionOption = selectedResolution;
    let defaultSettings = getDefaultScanSettings();
    let scannerDetails = getScannerDetails(defaultSettings);
    scannerDetails.Resolution = selectedResolution;
    this.saveDefaultScannerDetails(defaultSettings, scannerDetails);
  }

  handlePixelTypeChange(selectedPixelType) {
    this.selectedPixelTypeOption = selectedPixelType;
    let defaultSettings = getDefaultScanSettings();
    let scannerDetails = getScannerDetails(defaultSettings);
    scannerDetails.Color = selectedPixelType;
    this.saveDefaultScannerDetails(defaultSettings, scannerDetails);
  }

  handlePageSizeChange(selectedPageSize) {
    this.selectedPageSizeOption = selectedPageSize;
    let defaultSettings = getDefaultScanSettings();
    let scannerDetails = getScannerDetails(defaultSettings);
    scannerDetails.PageSize = selectedPageSize;
    this.saveDefaultScannerDetails(defaultSettings, scannerDetails);
  }

  handleDuplexChange(selectedDuplex) {
    this.selectedDuplexOption = selectedDuplex;
    let defaultSettings = getDefaultScanSettings();
    let scannerDetails = getScannerDetails(defaultSettings);
    scannerDetails.Duplex = selectedDuplex;
    this.saveDefaultScannerDetails(defaultSettings, scannerDetails);
  }

  handleCompressionChange(compressionType: any) {
    this.selectedCompressionOption = compressionType;
    let defaultSettings = getDefaultScanSettings();
    saveDefaultScanSettings(
      defaultSettings?.ScanType ?? this.selectedFileTypeOption,
      defaultSettings?.OCRType ?? this.selectedOcrOption,
      null,
      compressionType
    );
  }

  handleAcquireClick() {
    let acquireRequest = {
      deviceId: this.selectedDeviceId,
      resolutionId: this.selectedResolutionOption,
      pixelTypeId: this.selectedPixelTypeOption,
      pageSizeId: this.selectedPageSizeOption,
      documentSourceId: this.selectedDocumentSource,
      duplexId: this.selectedDuplexOption,
    };

    K1WebTwain.StartScan(acquireRequest)
      .then(() => {
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
      scannerInterface: K1WebTwain.Options.ScannerInterface.Hidden,
      scanButton: $("#scanbtn"), // the scan button
    };

    K1WebTwain.Configure(configuration)
      .then(() => {
        this.isDisplayUI = false;

        K1WebTwain.ResetService().then(function () {
          self.isDisplayUI = true;
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

        let mappedCompressionOptions = convertRawOptions(
          K1WebTwain.Options.FileCompressionType,
          true
        );

        this.ocrOptions = renderOptions(mappedOcrTypes);
        this.fileTypeOptions = renderOptions(mappedFileTypeOptions);
        this.compressionOptions = renderOptions(mappedCompressionOptions);
        this.discoveredDevices = renderOptions(mappedDevices);
        this.outputFilename = generateScanFileName();
        this.isDisplayScanningSection = true;

        const scanSettings = getDefaultScanSettings();

        if (scanSettings) {
          const deviceId = scanSettings?.ScannerDetails?.ScanSource ?? "-1";
          this.selectedFileTypeOption = scanSettings.ScanType;
          this.selectedOcrOption = scanSettings.UseOCR
            ? scanSettings.OCRType
            : K1WebTwain.Options.OcrType.None;
          this.selectedCompressionOption = scanSettings.FileCompressionType ?? (mappedCompressionOptions.length > 0 ? mappedCompressionOptions[0].value : "0");
          this.handleDeviceChange(deviceId);
        } else {
          this.handleDeviceChange(defaultOptionsValue(mappedDevices));
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
      defaultSettings?.OCRType ?? this.selectedOcrOption
    );
  }

  handlOcrTypeChange(ocrType: any) {
    this.selectedOcrOption = ocrType;
    let defaultSettings = getDefaultScanSettings();

    saveDefaultScanSettings(
      defaultSettings?.ScanType ?? this.selectedFileTypeOption,
      ocrType
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
      fileCompressionType: this.selectedCompressionOption,
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
