import { useRef, useEffect } from "react";

export default function useTimer(callback) {
  const savedCallback = useRef();
  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    let id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);
}