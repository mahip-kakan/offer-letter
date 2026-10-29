import { describe, expect, it } from "vitest";

import { searchPlace } from "./india-cities";

describe("Indian city names", () => {
  it("searches the official name for the old one", () => {
    expect(searchPlace("Bangalore")).toBe("Bengaluru");
    expect(searchPlace("gurgaon")).toBe("Gurugram");
    expect(searchPlace("Bombay")).toBe("Mumbai");
    expect(searchPlace("Calcutta")).toBe("Kolkata");
    expect(searchPlace("Madras")).toBe("Chennai");
  });

  it("treats NCR as Delhi, and leaves other cities alone", () => {
    expect(searchPlace("Delhi NCR")).toBe("Delhi");
    expect(searchPlace("ncr")).toBe("Delhi");
    expect(searchPlace("Pune")).toBe("Pune");
    expect(searchPlace("  ")).toBe("");
  });
});
