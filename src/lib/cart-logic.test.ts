import { describe, expect, it } from "vitest";
import { getProduct } from "./catalog";
import type { Product } from "./catalog-types";
import { addItem, cartTotal, parseStoredCart, removeItem, setQuantity, totalQuantity } from "./cart-logic";

const pads = getProduct("p1")!; // 145 GEL
const filter = getProduct("p2")!; // 28 GEL
const outOfStock = getProduct("p7")!;

describe("cart", () => {
  it("adding the same product twice updates quantity, no duplicate", () => {
    const c = addItem(addItem([], pads), pads);
    expect(c).toEqual([{ productId: "p1", quantity: 2 }]);
  });
  it("cannot add out-of-stock products", () => {
    expect(addItem([], outOfStock)).toEqual([]);
  });
  it("quantity never goes below 1", () => {
    expect(setQuantity([{ productId: "p1", quantity: 1 }], pads, "p1", 0)[0]!.quantity).toBe(1);
  });
  it("quantity capped by recorded stock", () => {
    const limited: Product = { ...pads, stockQty: 3 };
    expect(setQuantity([{ productId: "p1", quantity: 1 }], limited, "p1", 10)[0]!.quantity).toBe(3);
  });
  it("totals use GEL prices", () => {
    const c = addItem(addItem(addItem([], pads), pads), filter);
    expect(totalQuantity(c)).toBe(3);
    expect(cartTotal(c, getProduct)).toBe(318);
  });
  it("unknown products are excluded from total", () => {
    expect(cartTotal([{ productId: "nope", quantity: 2 }, { productId: "p2", quantity: 1 }], getProduct)).toBe(28);
  });
  it("remove empties cart", () => {
    expect(removeItem([{ productId: "p1", quantity: 2 }], "p1")).toEqual([]);
  });
  it("persisted cart round-trips and rejects garbage", () => {
    const c = addItem([], filter, 2);
    expect(parseStoredCart(JSON.stringify(c))).toEqual(c);
    expect(parseStoredCart("{bad")).toEqual([]);
    expect(parseStoredCart(JSON.stringify([{ productId: "p1", quantity: -1 }]))).toEqual([]);
  });
});
