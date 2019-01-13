import {TestBed} from '@angular/core/testing';

import {RobotManagerService} from './robot-manager.service';

describe('RobotManagerService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: RobotManagerService = TestBed.get(RobotManagerService);
        expect(service).toBeTruthy();
    });
});
