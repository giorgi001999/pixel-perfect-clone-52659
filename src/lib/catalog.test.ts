import { describe, expect, it } from "vitest";
import { getModels, getYears, listProducts } from "./catalog";

describe("catalog", () => {
  it("models depend on make", () => {
    expect(getModels("BMW")).toEqual(["3 Series (F30)"]);
  });
  it("years depend on model", () => {
    const y = getYears("Toyota", "Prius");
    expect(y[0]).toBe(2022);
    expect(y.at(-1)).toBe(2010);
  });
  it("only shows explicitly compatible products", () => {
    const ids = listProducts({ make: "Toyota", model: "Camry", year: 2020 }).map((p) => p.id);
    expect(ids).toEqual(["p2"]); // brake pads only recorded for 2012-2017
  });
  it("searches by OEM number ignoring dashes", () => {
    expect(listProducts({ q: "0446533471" }).map((p) => p.id)).toEqual(["p1"]);
  });
});
