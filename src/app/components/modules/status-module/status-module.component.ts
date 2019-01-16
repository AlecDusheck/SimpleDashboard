import { Component, OnDestroy, OnInit } from "@angular/core";
import { RobotManagerService } from "../../../services/robot-manager.service";
import { ConfigService } from "../../../services/config.service";

@Component({
  selector: "app-status-module",
  templateUrl: "./status-module.component.html",
  styleUrls: ["./status-module.component.scss"]
})
export class StatusModuleComponent implements OnInit, OnDestroy {

  public table: any;

  private onUpdate;

  constructor(
    private robotManager: RobotManagerService,
    public config: ConfigService
  ) {
    this.table = [];
  }

  ngOnInit(): void {
    this.onUpdate = this.robotManager.networkTables.onUpdate.subscribe(() => {
      this.table = [];
      this.config.settings.usage.map(pinnedVar => {
        let row = this.robotManager.networkTables.table.find(
          row => row.key === pinnedVar.name
        );

        if (row === undefined) {
          console.log(
            "Usage var '" + pinnedVar.name + " not found in Network Tables!"
          );
          return;
        }

        if (pinnedVar.bar.enabled) {
          try {
            const varFloat = Number.parseFloat(row.value);
            this.table.push({
              name: pinnedVar.friendlyName,
              isBar: true,
              value: Math.round(varFloat * 100) / 100,
              percentage: (varFloat / pinnedVar.bar.maxValue) * 100
            });
          } catch (e) {
            console.log(
              "Pinned var '" +
                pinnedVar.name +
                " throw error while doing math (" +
                e +
                ")"
            );
            return;
          }
        } else {
          this.table.push({
            name: pinnedVar.friendlyName,
            isBar: false,
            value: Math.round(row.value) / 100
          });
        }
      });

      // let battRow = this.robotManager.networkTables.table.find(
      //   row => row.key === "/SmartDashboard/simpledashboard.voltage"
      // );
      // if (battRow !== undefined) {
      //   try {
      //     const battValue = Number.parseFloat(battRow.value);
      //     this.batt = Math.round(battValue * 100) / 100;
      //     this.battPercentage = (battValue / 14.0) * 100;
      //     console.log("percentage: " + this.battPercentage);
      //   } catch (e) {
      //     console.error("Battery value is not a float!");
      //   }
      // } else {
      //   console.debug("No battery value emitted from robot! It might have not had the change to send it yet...");
      // }
    });
  }

  ngOnDestroy(): void {
    if (this.onUpdate) this.onUpdate.unsubscribe();
  }
}
