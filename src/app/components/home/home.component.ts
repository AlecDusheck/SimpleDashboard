import { Component, OnInit } from "@angular/core";
import { RobotManagerService } from "../../services/robot-manager.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  constructor(public robotManager: RobotManagerService) {}

  ngOnInit() {
    console.log("app dasdas done!");
  }
}
