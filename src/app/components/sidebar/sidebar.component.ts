import {Component, Injectable, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {RobotStatus} from "../../robot.status";

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public sidebarDisplayed: boolean;
  public currentUrl: string;
  public robotStatus: RobotStatus;

  constructor(private router: Router) { }

  ngOnInit() {
    this.sidebarDisplayed = true;
    //TODO: debugging
    this.robotStatus = RobotStatus.INIT;

    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.currentUrl = e.url;
      }
    });
  }

  public toggleSidebar = () => {
    this.sidebarDisplayed = !this.sidebarDisplayed;
  }

}
