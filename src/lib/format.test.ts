import { formatDuration, formatRating } from "./format";

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(155)).toBe("2h 35m");
  });

  it("formats duration in hours", () => {
    expect(formatDuration(120)).toBe("2h");
  });

  it("formats duration in minutes", () => {
    expect(formatDuration(45)).toBe("45m");
  });
});

describe("formatRating", () => {
  it("formats integer with one decimal place", () => {
    expect(formatRating(8)).toBe("8.0");
  });
});
