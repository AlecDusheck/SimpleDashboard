import { app, BrowserWindow, ipcMain, screen } from "electron";
import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";
import * as url from "url";
import * as wpilib from "wpilib-nt-client";
import { AppSettings } from "./src/app/app.settings";

let win;
let serve;

const args = process.argv.slice(1);
serve = args.some(val => val === "--serve");

// Get the wpilib client
const client = new wpilib.Client();
client.setReconnectDelay(1000);

const networkTablesRecieve = (key, value, valueType, msgType, id, flags) => {
  // If value comes in as a string and is supposed to be a boolean, convert it.
  if (value === "true" || value === "false") {
    value = value === "true";
  }

  // Assemble the data received into JSON
  const dataPackage = {
    key: key,
    value: value,
    valueType: valueType,
    msgType: msgType,
    id: id,
    flags: flags
  };

  console.log("packaging data: " + JSON.stringify(dataPackage));
  // Emit the data to IPC
  win.webContents.send("received", dataPackage);
};

const loadSettings = async () => {
  const configPath = path.join(os.homedir(), ".simpledashboard/config.json");
  let settings: AppSettings;
  try {
    // FYI: The <AppSettings><unknown> allows the cast to AppSettings
    settings = await (<AppSettings>(<unknown>fs.readJson(configPath)));
  } catch (e) {
    console.debug(e);
    // Check if the file isn't found.
    if (e.code !== "ENOENT") {
      // Rethrow
      throw e;
    }
    // The file doesn't exist... create one.
    console.warn("Generating new config file...");
    // Default settings
    settings = {
      clickableBool: {},
      feedSettings: { width: 900, height: 600 },
      pinnedVars: {},
      robotConnection: { addr: "roborio-2502-frc.local" },
    };

    await fs.outputJson(configPath, settings);
  }
  return settings;
};

const createWindow = () => {
  //This is needed because of a weird-ass Electron error
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: Math.round(size.height * .88) //TODO: update to actual size
  });

  console.debug("created window with bounds " + size.width + "x" + Math.round(size.height * .88));

  if (serve) {
    require("electron-reload")(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL("http://localhost:4200");
  } else {
    console.debug("loading URL: " + url.format({
      pathname: path.join(__dirname, "../../dist/angular/index.html"),
      protocol: "file:",
      slashes: true
    }));
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, "../../dist/angular/index.html"),
        protocol: "file:",
        slashes: true
      })
    );
  }

  // Read settings from JSON
  ipcMain.on("getSettings", event => {
    loadSettings().then(store => {
      console.debug("got store! " + JSON.stringify(store));

      // Emit the settings
      event.sender.send("settings", store);
    });
  });

  // Prep the IPC socket for using NetworkTables
  ipcMain.on("connect", (event, address) => {
    // Check to see if we're already connected to the Robot
    if (client.isConnected()) {
      console.log("[NT] Cleaning up...");
      // We are... clean up
      client.removeListener(networkTablesRecieve);
      client.destroy();
    }

    console.log("[NT] Connecting to robot @ " + address);
    client.start((connected, err) => {
      if (err) {
        console.log("[NT] Failed to connect. (" + err + ")");
        // @ts-ignore
        event.sender.send("error", "Failed to connect. (" + err + ")");
        return;
      } else if (!connected) {
        console.log("[NT] Failed to connect. (no robot)");
        // @ts-ignore
        event.sender.send.send("error", "Failed to connect. (no robot)");
        return;
      }

      client.addListener(networkTablesRecieve);
      console.log(
        "[NT] Connected (connected: " + connected + ", err: " + err + ")"
      );
      event.sender.send.emit("connected");
    }, address);
  });

  // Emitted when the window is closed.
  win.on("closed", () => {
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
  app.on("ready", createWindow);

  // Quit when all windows are closed.
  app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
