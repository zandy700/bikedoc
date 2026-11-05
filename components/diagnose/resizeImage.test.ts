import { describe, expect, it } from "vitest";
import { fitWithin } from "./resizeImage";

describe("fitWithin", () => {
  it("leaves images already within the limit unchanged", () => {
    expect(fitWithin(800, 600, 1024)).toEqual({ width: 800, height: 600 });
    expect(fitWithin(1024, 1024, 1024)).toEqual({ width: 1024, height: 1024 });
  });

  it("scales landscape images by the width", () => {
    expect(fitWithin(4032, 3024, 1024)).toEqual({ width: 1024, height: 768 });
  });

  it("scales portrait images by the height", () => {
    expect(fitWithin(3000, 4000, 1024)).toEqual({ width: 768, height: 1024 });
  });

  it("never returns a zero dimension for extreme aspect ratios", () => {
    expect(fitWithin(10000, 5, 1024)).toEqual({ width: 1024, height: 1 });
  });

  it("returns 0x0 for invalid input", () => {
    expect(fitWithin(0, 100, 1024)).toEqual({ width: 0, height: 0 });
    expect(fitWithin(100, 100, 0)).toEqual({ width: 0, height: 0 });
    expect(fitWithin(Number.NaN, 100, 1024)).toEqual({ width: 0, height: 0 });
  });
});
