export interface Usage {
  zindex: number;
  name: string;
  bar: {
    maxValue: number;
    enabled: boolean;
  }
  friendlyName: string;
}
export interface ClickableBool{
      inverted: boolean;
      friendlyName: string;
      name: string;
}


export interface AppSettings {
  clickableBool: ClickableBool[]
  usage: Usage[]

  feedSettings: {
    width: number;
    height: number;
  };

  robotConnection: {
    addr: string;
  };
}
