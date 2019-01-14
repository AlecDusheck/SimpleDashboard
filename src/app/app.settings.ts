export interface AppSettings {
  clickableBool: {
    [keyName: string]: { inverted: boolean; friendlyName: string };
  };

  pinnedVars: {
    [keyName: string]: {
      index: number;
      maxValue: number;
      minValue: number;
      friendlyName: string;
    };
  };

  feedSettings: {
    width: number;
    height: number;
  };

  window: {
    smartDashboard: boolean,
    fullscreen: boolean
  };

  robotConnection: {
    addr: string;
  };
}
