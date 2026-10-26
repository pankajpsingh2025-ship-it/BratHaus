"use client";
// The pointer, normalised to −1…1 (y up), from ONE passive listener on window: 3D that lives in a
// drei <View> reads this instead of relying on the View's own event routing.
export const pointer = { x: 0, y: 0 };
if (typeof window !== "undefined") {
  addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / innerHeight) * 2 - 1);
  }, { passive: true });
}
