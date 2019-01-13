"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var wpilib = require("wpilib-nt-client");
var fs = require("fs-extra");
var os = require("os");
var win, serve;
var args = process.argv.slice(1);
serve = args.some(function (val) { return val === '--serve'; });
// Get the wpilib client
var client = new wpilib.Client();
client.setReconnectDelay(1000);
var networkTablesRecieve = function (key, value, valueType, msgType, id, flags) {
    // If value comes in as a string and is supposed to be a boolean, convert it.
    if (value === 'true' || value === 'false') {
        value = value === 'true';
    }
    // Assemble the data received into JSON
    var dataPackage = {
        key: key,
        value: value,
        valueType: valueType,
        msgType: msgType,
        id: id,
        flags: flags
    };
    console.log('packaging data: ' + JSON.stringify(dataPackage));
    // Emit the data to IPC
    win.webContents.send('received', dataPackage);
};
var loadSettings = function () { return __awaiter(_this, void 0, void 0, function () {
    var configPath, settings, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                configPath = path.join(os.homedir(), '.simpledashboard/config.json');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 5]);
                return [4 /*yield*/, fs.readJson(configPath)];
            case 2:
                // FYI: The <AppSettings><unknown> allows the cast to AppSettings
                settings = _a.sent();
                return [3 /*break*/, 5];
            case 3:
                e_1 = _a.sent();
                // Check if the file isn't found.
                if (e_1.code !== 'ENOENT') {
                    // Rethrow
                    throw e_1;
                }
                //The file doesn't exist... create one.
                console.warn('Generating new config file...');
                settings = {
                    clickableBool: {},
                    feedSettings: { width: 900, height: 600 },
                    pinnedVars: {},
                    robotConnection: { addr: 'roborio-2502-frc.local' }
                };
                return [4 /*yield*/, fs.outputJson(configPath, settings)];
            case 4:
                _a.sent();
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/, settings];
        }
    });
}); };
var createWindow = function () {
    var electronScreen = electron_1.screen;
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height
    });
    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(__dirname + "/node_modules/electron")
        });
        win.loadURL('http://localhost:4200');
    }
    else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    win.webContents.openDevTools();
    electron_1.ipcMain.on('getSettings', function (event) {
        loadSettings().then(function (store) {
            event.sender.send('settings', store);
        });
    });
    // Prep the IPC socket for using NetworkTables
    electron_1.ipcMain.on('connect', function (event, address) {
        // Check to see if we're already connected to the Robot
        if (client.isConnected()) {
            console.log('[NT] Cleaning up...');
            // We are... clean up
            client.removeListener(networkTablesRecieve);
            client.destroy();
        }
        console.log('[NT] Connecting to robot @ ' + address);
        client.start(function (connected, err) {
            if (err) {
                console.log('[NT] Failed to connect. (' + err + ')');
                // @ts-ignore
                event.sender.send('error', 'Failed to connect. (' + err + ')');
                return;
            }
            else if (!connected) {
                console.log('[NT] Failed to connect. (no robot)');
                // @ts-ignore
                event.sender.send.send('error', 'Failed to connect. (no robot)');
                return;
            }
            client.addListener(networkTablesRecieve);
            console.log('[NT] Connected (connected: ' + connected + ', err: ' + err + ')');
            event.sender.send.emit('connected');
        }, address);
    });
    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
};
try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    electron_1.app.on('ready', createWindow);
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
}
catch (e) {
    // Catch Error
    // throw e;
}
//# sourceMappingURL=main.js.map