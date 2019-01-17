import { Injectable } from "@angular/core";
import { AppSettings } from "../app.settings";
import { ElectronService } from "../providers/electron.service";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  public settings: AppSettings;

  constructor(private electronService: ElectronService) {}

  public load = (): Promise<void> => {
    return new Promise(resolve => {
      // Get the settings from IPC
      this.electronService.ipcRenderer.send("getSettings");
      // Wait for res
      this.electronService.ipcRenderer.on("settings", (_, store) => {
        // Haha wtf are you talking about TSLint
        console.debug("Read store from Electron: " + JSON.stringify(store));
        this.settings = store;
        return resolve();
      });
    });
  };
}
