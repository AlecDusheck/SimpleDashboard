import {Injectable, NgZone} from '@angular/core';
import {ElectronService} from '../providers/electron.service';

@Injectable({
    providedIn: 'root'
})
export class RobotManagerService {
    public error: string;

    constructor(private electronService: ElectronService, private zone: NgZone) {
    }

    init(): void {
        if (!this.electronService.isElectron()) {
            console.warn('Not running NetworkTables due to the fact your not running this in Electron!');
            return;
        }
        this.electronService.ipcRenderer.on('error', (_, msg) => {
            console.log('Got error: ' + msg);
            this.zone.run(() => {
                this.error = msg;
            });
        });
        // TODO: remove hard coded
        this.electronService.ipcRenderer.send('connect', 'roborio-2502-frc.local');
    }
}
