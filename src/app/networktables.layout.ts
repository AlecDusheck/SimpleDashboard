export interface NetworktablesLayout
  extends Array<{
    key: string;
    value: any;
    valueType: string;
    msgType: string;
    id: number;
    flags: number;
  }> {}
