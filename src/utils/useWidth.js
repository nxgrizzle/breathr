import { useState, useLayoutEffect } from "react";

export default function useWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useLayoutEffect(() => {
    window.onresize = () => setWidth(window.innerWidth);
    return () => (document.onresize = undefined);
  });
  return width;
}
