import { APP_INITIALIZER, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import "reflect-metadata";
import "../polyfills";

import { HttpClient, HttpClientModule } from "@angular/common/http";

// NG Translate
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { AppRoutingModule } from "./app-routing.module";

import { ElectronService } from "./providers/electron.service";

import { WebviewDirective } from "./directives/webview.directive";

import { AppComponent } from "./app.component";
import { DebugComponent } from "./components/debug/debug.component";
import { HomeComponent } from "./components/home/home.component";
import { StatusModuleComponent } from "./components/modules/status-module/status-module.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { ConfigService } from "./services/config.service";
import { RobotManagerService } from "./services/robot-manager.service";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WebviewDirective,
    SidebarComponent,
    SettingsComponent,
    StatusModuleComponent,
    DebugComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    ElectronService,
    {
      provide: APP_INITIALIZER,
      useFactory: (
        config: ConfigService,
        robotManager: RobotManagerService
      ) => () => {
        return new Promise(resolve => {
          config.load().then(() => {
            robotManager.connect();
            return resolve();
          });
        });
      },
      deps: [ConfigService, RobotManagerService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
