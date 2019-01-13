import {Injectable, OnInit} from '@angular/core';
import {ElectronService} from '../providers/electron.service';

@Injectable({
    providedIn: 'root'
})
export class RobotManagerService {

    constructor(private electronService: ElectronService) {}

    connect(): void {
        console.log('fired connect');
        console.log(this.electronService);
        if (this.electronService.isElectron()) {
            console.log('star fire');
            this.electronService.ipcRenderer.send('connect', 'roborio-2502-frc.local');
        } else {
            console.log('Not running NetworkTables due to the fact your not running this in Electron!');
        }
    }
}
