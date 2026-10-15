import { parseHistory } from "./watchHistoryStore";

describe("parseHistory", () => {
  it("parses a valid history", () => {
    const raw = JSON.stringify({ 1: { progress: 40, updatedAt: 100 } });

    expect(parseHistory(raw)).toEqual({ 1: { progress: 40, updatedAt: 100 } });
  });

  it("returns an empty history when nothing is stored", () => {
    expect(parseHistory(null)).toEqual({});
  });

  it("returns an empty history for corrupted JSON", () => {
    expect(parseHistory("garbage")).toEqual({});
  });

  it("returns an empty history when the stored value is not an object", () => {
    expect(parseHistory("[1, 2, 3]")).toEqual({});
  });

  it("keeps valid entries and drops invalid ones", () => {
    const raw = JSON.stringify({
      1: { progress: 40, updatedAt: 100 },
      2: { progress: 150, updatedAt: 100 },
      3: { progress: "50", updatedAt: 100 },
    });

    expect(parseHistory(raw)).toEqual({
      1: { progress: 40, updatedAt: 100 },
    });
  });
});
