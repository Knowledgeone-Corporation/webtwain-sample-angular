import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ScanErrorComponent } from './scan-error/scan-error.component';
import { ScanCompletedComponent } from './scan-completed/scan-completed.component';
import { ScannerInterfaceVisibleComponent } from './scanner-interface-visible/scanner-interface-visible.component';
import { ScannerInterfaceWebComponent } from './scanner-interface-web/scanner-interface-web.component';
import { ScannerInterfaceDescktopComponent } from './scanner-interface-desktop/scanner-interface-desktop.component';
import { ScannerInterfaceHiddenComponent } from './scanner-interface-hidden/scanner-interface-hidden.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ScanErrorComponent,
    ScanCompletedComponent,
    ScannerInterfaceVisibleComponent,
    ScannerInterfaceWebComponent,
    ScannerInterfaceDescktopComponent,
    ScannerInterfaceHiddenComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
