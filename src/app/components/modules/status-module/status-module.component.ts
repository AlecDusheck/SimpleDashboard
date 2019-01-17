import { Component, OnDestroy, OnInit } from "@angular/core";
import { ConfigService } from "../../../services/config.service";
import { RobotManagerService } from "../../../services/robot-manager.service";

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

  public ngOnInit(): void {
    this.onUpdate = this.robotManager.networkTables.onUpdate.subscribe(() => {
      this.table = [];
      this.config.settings.usage.map(pinnedVar => {
        const row = this.robotManager.networkTables.table.find(
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
            const currentVoltage = Number.parseFloat(row.value);

            this.table.push({
              name: pinnedVar.friendlyName,
              isBar: true,
              value: Math.round(currentVoltage * 100) / 100,
              percentage:
                ((currentVoltage - pinnedVar.bar.minValue) /
                  (pinnedVar.bar.maxValue - pinnedVar.bar.minValue)) *
                100
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
    });
  }

  public ngOnDestroy(): void {
    if (this.onUpdate) { this.onUpdate.unsubscribe(); }
  }
}
