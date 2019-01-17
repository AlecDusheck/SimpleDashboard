import { Component, OnInit } from "@angular/core";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ElectronService} from '../../providers/electron.service';
import { RobotManagerService } from "../../services/robot-manager.service";

@Component({
  selector: "app-debug",
  templateUrl: "./debug.component.html",
  styleUrls: ["./debug.component.scss"]
})
export class DebugComponent implements OnInit {

  public insertForm: FormGroup;
  public insertLoading = false;
  public insertSubmitted = false;

  constructor(public robotManager: RobotManagerService,
              private formBuilder: FormBuilder,
              private electronService: ElectronService) {
    this.insertForm = formBuilder.group({
      key: ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      value: ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
    });
  }

  public ngOnInit() {}

  public onInsert(): void{
      if(this.insertForm.invalid) {
        return;
      }

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
