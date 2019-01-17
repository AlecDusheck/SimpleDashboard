import { Component, OnInit } from "@angular/core";
import { RobotManagerService } from "../../services/robot-manager.service";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ElectronService} from '../../providers/electron.service';

@Component({
  selector: "app-debug",
  templateUrl: "./debug.component.html",
  styleUrls: ["./debug.component.scss"]
})
export class DebugComponent implements OnInit {

  insertForm: FormGroup;
  insertLoading = false;
  insertSubmitted = false;

  constructor(public robotManager: RobotManagerService,
              private formBuilder: FormBuilder,
              private electronService: ElectronService) {
    this.insertForm = formBuilder.group({
      key: ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      value: ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
    });
  }

  ngOnInit() {}

  onInsert(): void{
      if(this.insertForm.invalid)
        return;

      this.insertSubmitted = true;
      this.insertLoading = true;

      const onUpdated = () => {
        this.insertLoading = false;
        this.electronService.ipcRenderer.removeListener('updated', onUpdated);
      };

      this.electronService.ipcRenderer.on('updated', onUpdated);
      this.electronService.ipcRenderer.send("put", {data: this.insertForm.controls.value.value, id: this.insertForm.controls.key.value})
  }
}
