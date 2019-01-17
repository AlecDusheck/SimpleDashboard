import { Component, Injectable, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { RobotManagerService } from "../../services/robot-manager.service";

@Injectable({
  providedIn: "root"
})
@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"]
})
export class SidebarComponent implements OnInit {
  public sidebarDisplayed: boolean;
  public currentUrl: string;

  constructor(
    private router: Router,
    public robotManager: RobotManagerService
  ) {}

  public ngOnInit() {
    // TODO: debugging
    this.sidebarDisplayed = true;

    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.currentUrl = e.url;
      }
    });
  }

  public toggleSidebar = () => {
    this.sidebarDisplayed = !this.sidebarDisplayed;
  };
}
