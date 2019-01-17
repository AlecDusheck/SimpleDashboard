import { app, BrowserWindow, ipcMain, screen } from "electron";
import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";
import * as url from "url";
import * as wpilib from "wpilib-nt-client";
import { AppSettings, ClickableBool, Usage } from "./src/app/app.settings";

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
    key,
    value,
    valueType,
    msgType,
    id,
    flags
  };

  console.log("packaging data: " + JSON.stringify(dataPackage));
  // Emit the data to IPC
  win.webContents.send("received", dataPackage);
};

const loadSettings = async () => {
  // This is the main config file path
  const configPath = path.join(os.homedir(), ".simpledashboard/config.json");

  let settings: AppSettings;
  try {
    // FYI: The <AppSettings><unknown> allows the cast to AppSettings
    settings = await ((fs.readJson(configPath) as unknown) as AppSettings);
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
      clickableBool: [],
      feedSettings: { width: 900, height: 600 },
      usage: [
        {
          zindex: 1,
          name: "/SmartDashboard/simpledashboard.voltage",
          bar: {
            maxValue: 13,
            minValue: 10,
            enabled: true
          },
          friendlyName: "Voltage"
        }
      ],
      robotConnection: { addr: "roborio-2502-frc.local" }
    };

    await fs.outputJson(configPath, settings);
  }
  return settings;
};

const createWindow = () => {
  // This is needed because of a weird-ass Electron error
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: Math.round(size.height * 0.5), // TODO: update to actual size
    title: "Simple Dashboard"
  });
  // Hide the useless Electron menu bar
  win.setMenuBarVisibility(false);

  console.debug(
    "created window with bounds " +
      size.width +
      "x" +
      Math.round(size.height * 0.88)
  );

  // Serve the web page
  // This needs to point to the Angular /dist/angular folder during dev
  if (serve) {
    require("electron-reload")(__dirname, {
      electron: require(`${__dirname}/../../node_modules/electron`)
    });
    win.loadURL("http://localhost:4200");
  } else {
    console.debug(
      "loading URL: " +
        url.format({
          pathname: path.join(__dirname, "../../dist/angular/index.html"),
          protocol: "file:",
          slashes: true
        })
    );
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, "../../dist/angular/index.html"),
        protocol: "file:",
        slashes: true
      })
    );
  }

  // Read settings from JSON when the IPC requests it
  ipcMain.on("getSettings", event => {
    loadSettings().then(store => {
      console.debug("got store! " + JSON.stringify(store));

      // Emit the settings to the sender
      event.sender.send("settings", store);
    });
  });

  // On put
  ipcMain.on("put", (event, data) => {
    if (!client.isConnected()) { return; } // We're not connected

    let value = data.data;

    // Convert to number if we can
    if(!Number.isNaN(Number.parseFloat(value))) {
      value = Number.parseFloat(value);
    }

    // Convert to number if we can
    if(value === "true" || value === "false") {
      value = value === "true";
    }

    const id = client.getKeyID(data.id);

    if (id !== undefined) {
      client.Update(id, value);
    }
    else {
      client.Assign(value, data.id, false);
    }

    event.sender.send('updated');
  });

  // Prep the IPC socket for using NetworkTables
  ipcMain.on("connect", (event, address) => {
    console.log("[NT] Connecting to robot @ " + address);

    // Connect to the robot using WPILIB
    client.start((connected, err) => {
      // Make sure we don't double register the listener...
      client.removeListener(networkTablesRecieve);

      // Check for errors
      if (err) {
        console.log("[NT] Failed to connect. (" + err + ")");

        // Apparently this function doesn't exist... So why is it documented and works?!
        // @ts-ignore
        event.sender.send("error", "Failed to connect. (" + err + ")");
        return;
      } else if (!connected) {
        console.log("[NT] Failed to connect. (no robot)");

        // Apparently this function doesn't exist... So why is it documented and works?!
        // @ts-ignore
        event.sender.send("error", "Failed to connect. (no robot)");
        return;
      }

      // Add networkTablesRecieve to the client
      client.addListener(networkTablesRecieve);

      console.log(
        "[NT] Connected (connected: " + connected + ", err: " + err + ")"
      );

      // Emit that we connected to the robot
      event.sender.send("connected");
    }, address);
  });

  win.webContents.openDevTools();

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
