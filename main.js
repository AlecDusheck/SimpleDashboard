"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var wpilib = require("wpilib-nt-client");
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
    electron_1.ipcMain.emit('received', dataPackage);
};
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
    // Prep the IPC socket for using NetworkTables
    electron_1.ipcMain.on('connect', function (event, address) {
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