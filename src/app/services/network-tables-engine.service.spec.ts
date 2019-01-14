import { TestBed } from "@angular/core/testing";

import { NetworkTablesEngineService } from "./network-tables-engine.service";

describe("NetworkTablesEngineService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: NetworkTablesEngineService = TestBed.get(
      NetworkTablesEngineService
    );
    expect(service).toBeTruthy();
  });
});
