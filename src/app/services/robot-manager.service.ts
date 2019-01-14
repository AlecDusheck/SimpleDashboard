import { Injectable, NgZone } from "@angular/core";
import { ElectronService } from "../providers/electron.service";
import { RobotStatus } from "../robot.status";
import { ConfigService } from "./config.service";

@Injectable({
  providedIn: "root"
})
export class RobotManagerService {
  public error: string;
  public status: RobotStatus;

  constructor(
    private electronService: ElectronService,
    private zone: NgZone,
    private config: ConfigService
  ) {
    // On WPILIB error
    this.electronService.ipcRenderer.on("error", (_, msg) => {
      // For some reason Angular isn't updated after IPC calls are fired.
      // Update the Angular Zone after the IPC updates.
      this.zone.run(() => {
        this.error = msg;
      });
    });
    // On WPILIB initial connect
    this.electronService.ipcRenderer.on("connected", () => {
      this.status = RobotStatus.IDLE;
    });

    this.status = RobotStatus.DISCONNECTED;
  }

  connect(): void {
    // Check if we're running in Electron or in debug
    if (!this.electronService.isElectron()) {
      console.warn(
        "Not running NetworkTables due to the fact your not running this in Electron!"
      );
      return;
    }
    // Connect to robot
    this.electronService.ipcRenderer.send(
      "connect",
      this.config.settings.robotConnection.addr
    );
  }
}
