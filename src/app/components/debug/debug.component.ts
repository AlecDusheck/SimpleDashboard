import { Component, OnInit } from '@angular/core';
import {RobotManagerService} from '../../services/robot-manager.service';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.scss']
})
export class DebugComponent implements OnInit {

  constructor(public robotManager: RobotManagerService) { }

  ngOnInit() {
  }

}
