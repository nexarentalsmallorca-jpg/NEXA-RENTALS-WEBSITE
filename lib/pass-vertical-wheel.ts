import type { WheelEvent } from "react";

/**
 * Browsers often trap the wheel over wide overflow-x clips (e.g. blog marquees).
 * Forward vertical wheel movement to the page once (call from a single handler).
 */
export function passVerticalWheelToPage(event: WheelEvent<HTMLElement>) {
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

  event.preventDefault();
  event.stopPropagation();
  window.scrollBy({
    top: event.deltaY,
    left: 0,
    behavior: "auto",
  });
}
