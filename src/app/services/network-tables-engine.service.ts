import { EventEmitter, Injectable, NgZone } from "@angular/core";
import { NetworktablesLayout } from "../networktables.layout";
import { ElectronService } from "../providers/electron.service";

@Injectable({
  providedIn: "root"
})
export class NetworkTablesEngineService {
  public table: NetworktablesLayout;
  public onUpdate: EventEmitter<any>;

  constructor(private electronService: ElectronService, private zone: NgZone) {
    this.onUpdate = new EventEmitter();
    this.table = [];
    this.listen();
  }

  private listen = () => {
    console.log("network here");
    this.electronService.ipcRenderer.on("received", (event, data) => {
      this.zone.run(() => {
        // Tell the app we received an update.
        this.onUpdate.emit();

        const index = this.table.findIndex(
          existingValue => existingValue.key === data.key
        );
        if (index !== -1) {
          // Existing value, insert into the index
          this.table[index] = data;
        } else {
          // New value, push it!
          this.table.push(data);
        }
      });
    });
  };
}
