import {AngularElectronPage} from './app.po';
import {by, element} from 'protractor';

describe('angular-electron App', () => {
    let page: AngularElectronPage;

    beforeEach(() => {
        page = new AngularElectronPage();
    });

    it('should display message saying App works !', () => {
        page.navigateTo('/');
        expect(element(by.css('app-home h1')).getText()).toMatch('App works !');
    });
});
