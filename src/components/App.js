import "./App.css";
import Options from "./Options";
import Download from "./Download";
import Branding from "./Branding";
import Slider from "./Slider";
import Canvas from "./Canvas";
import Header from "./Header";
import Settings from "./Settings";
import useFullscreen from "../utils/useFullScreen";
import useTimer from "../utils/useTimer";
import useWidth from "../utils/useWidth";
import { Stage, Layer, Text, Circle, Rect, Group } from "react-konva";
import Konva from "konva";

// gif downloads work, they just take several minutes. clean it up and warn.

// fullscreen works, just scrub it to personalize it
// pause and play also works, just pretty sloppy

import { CanvasCapture } from "canvas-capture";

import { useRef, useEffect, useState } from "react";
import SlidersContainer from "./SlidersContainer";
export const App = () => {
  const width = useWidth();
  const activeTweens = useRef(null);
  const [active, setActive] = useState(true);
  // leaving the window counts as hibernation, so use system time
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState({
    start: Math.floor(Date.now() / 1000),
    now: Math.floor(Date.now() / 1000),
  });
  const [state, setState] = useState({
    current: 0,
    radius: 150,
    size: width > 600 ? 500 : 300,
    inPos: {
      x: -1 * (width > 600 ? 500 / 2 : 300 / 2),
      y: -1 * (width > 600 ? 500 / 2 : 300 / 2),
    },
    outPos: {
      x: -0.5 * (width > 600 ? 500 / 2 : 300 / 2),
      y: -0.5 * (width > 600 ? 500 / 2 : 300 / 2),
    },
    in: null,
    inHold: null,
    out: null,
    outHold: null,
    inDuration: 4,
    inHoldDuration: 0,
    outDuration: 6,
    outHoldDuration: 0,
    skipInHold: true,
    skipOutHold: true,
    isDownloading: false,
    downloadWasTriggered: false,
    text: ["inhale", "hold", "exhale", "hold"],
  });
  const circleRef = useRef(null);
  const textRef = useRef(null);
  const bodyRef = useRef(null);
  const tweenFinished = () => {
    // if state === in and skip hold (or state === out and skip out, then skip, else go onto next breath)
    setState((prev) => ({
      ...prev,
      current:
        prev.current % 4 === 0 && prev.skipInHold
          ? prev.current + 2
          : prev.current % 4 === 2 && prev.skipOutHold
          ? prev.current + 2
          : prev.current + 1,
    }));
  };

  useEffect(() => {
    if (activeTweens.current != null) {
      if (active) {
        activeTweens.current.circle.play();
        activeTweens.current.text.play();
      } else {
        activeTweens.current.circle.pause();
        activeTweens.current.text.pause();
      }
    }
  }, [active]);
  useEffect(() => {
    if (circleRef.current != null && textRef.current != null) {
      // ok set tweens after refs have mounted
      // if the duration has changed, reset all the tweens from the beginning
      circleRef.current.scale({ x: 1, y: 1 });
      textRef.current.scale({ x: 1, y: 1 });
      textRef.current.x(-0.5 * (state.size / 2));
      textRef.current.y(-0.5 * (state.size / 2));
      // then create new tweens
      const inTween = {
        easing: Konva.Easings.EaseInOut,
        scaleX: 2,
        scaleY: 2,
        duration: state.inDuration,
      };
      const inHoldTween = {
        easing: Konva.Easings.EaseInOut,
        duration: state.inHoldDuration,
      };
      const outTween = {
        easing: Konva.Easings.EaseInOut,
        scaleX: 1,
        scaleY: 1,
        duration: state.outDuration,
      };
      const outHoldTween = {
        easing: Konva.Easings.EaseInOut,
        duration: state.outHoldDuration,
      };
      setState((prev) => ({
        ...prev,
        current: 0,
        in: inTween,
        inHold: inHoldTween,
        outHold: outHoldTween,
        out: outTween,
      }));
    }
  }, [
    circleRef,
    textRef,
    state.inDuration,
    state.inHoldDuration,
    state.outDuration,
    state.outHoldDuration,
    state.isDownloading,
    state.size,
  ]);
  // when duration changes, go to the respective tween and set it to {...inTween, duration:newDuration}

  useEffect(() => {
    if (circleRef.current != null && textRef.current != null) {
      const canvas = document.querySelector("canvas");
      CanvasCapture.init(canvas);
    }
    // why does isDownloading pause everything. like, everything.
  }, [circleRef, textRef]);
  useEffect(() => {
    if (state.isDownloading) {
      CanvasCapture.beginGIFRecord({
        name: "breathr",
        fps: 30,
        onExportProgress: (progress) => {
          setProgress(progress);
        },
      });
    }
  }, [state.isDownloading]);
  useEffect(() => {
    const onFrameUpdate = () => {
      if (state.isDownloading) CanvasCapture.recordFrame();
    };
    let circleTween;
    let textTween;
    if (state.in != null) {
      if (state.current % 4 === 0) {
        circleTween = new Konva.Tween({
          ...state.in,
          node: circleRef.current,
          onUpdate: onFrameUpdate,
          onFinish: () => {
            tweenFinished();
            circleTween.destroy();
          },
        });
        textTween = new Konva.Tween({
          ...state.in,
          ...state.inPos,
          node: textRef.current,
        });
      }
      if (state.current % 4 === 1) {
        circleTween = new Konva.Tween({
          ...state.inHold,
          node: circleRef.current,
          onUpdate: onFrameUpdate,
          onFinish: () => {
            tweenFinished();
            circleTween.destroy();
          },
        });
        textTween = new Konva.Tween({ ...state.inHold, node: textRef.current });
      }
      if (state.current % 4 === 2) {
        circleTween = new Konva.Tween({
          ...state.out,
          node: circleRef.current,
          onUpdate: onFrameUpdate,
          onFinish: () => {
            tweenFinished();
            circleTween.destroy();
            if (state.isDownloading && state.skipOutHold) {
              setState((prev) => ({ ...prev, isDownloading: false }));
              CanvasCapture.stopRecord();
            }
          },
        });
        textTween = new Konva.Tween({
          ...state.out,
          ...state.outPos,
          node: textRef.current,
        });
      }
      if (state.current % 4 === 3) {
        circleTween = new Konva.Tween({
          ...state.outHold,
          node: circleRef.current,
          onUpdate: onFrameUpdate,
          onFinish: () => {
            tweenFinished();
            circleTween.destroy();
            if (state.isDownloading) {
              setState((prev) => ({ ...prev, isDownloading: false }));
              CanvasCapture.stopRecord();
            }
          },
        });

        textTween = new Konva.Tween({ ...state.inHold, node: textRef.current });
      }
      // if !paused
      activeTweens.current = { circle: circleTween, text: textTween };
      if (active) {
        circleTween.play();
        textTween.play();
      }
    }
    return () => {
      if (circleTween != null) {
        circleTween.destroy();
        textTween.destroy();
      }
    };
  }, [state, active]);
  const padNumber = (number) => {
    return String(number).padStart(2, "0");
  };
  const handleTimeChange = () => {
    setTime((prev) => ({ ...prev, now: Math.floor(Date.now() / 1000) }));
  };
  const displayTime = () => {
    let elapsed = time.now - time.start;
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = Math.floor((elapsed % 3600) % 60);
    return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`;
  };
  useTimer(() => handleTimeChange());
  let isFullscreen, setFullscreen;
  try {
    [isFullscreen, setFullscreen] = useFullscreen(bodyRef);
  } catch (e) {
    isFullscreen = false;
    setFullscreen = undefined;
  }
  const handleExitFullscreen = () => document.exitFullscreen();

  const handleDurationChange = (breathState, duration, skip) => {
    if (breathState === "inhale") {
      setState((prev) => ({ ...prev, inDuration: duration }));
    } else if (breathState === "first breath hold") {
      setState((prev) => ({
        ...prev,
        inHoldDuration: duration,
        skipInHold: skip,
      }));
    } else if (breathState === "exhale") {
      setState((prev) => ({ ...prev, outDuration: duration }));
    } else if (breathState === "second breath hold") {
      setState((prev) => ({
        ...prev,
        outHoldDuration: duration,
        skipOutHold: skip,
      }));
    } else throw new Error("Unknown string provided");
  };

  const handleDownload = () => {
    setState((prev) => ({
      ...prev,
      isDownloading: true,
      downloadWasTriggered: true,
    }));
  };
  return (
    <div
      ref={bodyRef}
      style={{
        width: "100vw",
        height: "100vh",
        maxWidth: "100%",
        overflowX: "hidden",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Header>
        <Branding />
        <Settings>
          <div style={{ width: "100%", background: "inherit" }}>
            <h3
              style={{
                background: "inherit",
                margin: "2.5rem 0 1rem 0",
                textAlign: "center",
              }}
            >
              Presets
            </h3>
            <div
              style={{
                margin: " 0 1rem 1rem",
                background: "inherit",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    inDuration: 4,
                    inHoldDuration: 0,
                    outDuration: 6,
                    outHoldDuration: 0,
                    skipOutHold: true,
                    skipInHold: true,
                  }))
                }
                style={{ background: "inherit", cursor: "pointer" }}
              >
                Default
              </p>
              <p
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    inDuration: 4,
                    inHoldDuration: 4,
                    outDuration: 4,
                    outHoldDuration: 4,
                    skipInHold: false,
                    skipOutHold: false,
                  }))
                }
                style={{ background: "inherit", cursor: "pointer" }}
              >
                Square
              </p>
              <p
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    inDuration: 4,
                    inHoldDuration: 8,
                    outDuration: 7,
                    outHoldDuration: 0,
                    skipInHold: false,
                    skipOutHold: true,
                  }))
                }
                style={{ background: "inherit", cursor: "pointer" }}
              >
                4-7-8
              </p>
              <p
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    inDuration: 1,
                    inHoldDuration: 0,
                    outDuration: 1,
                    outHoldDuration: 0,
                    skipInHold: true,
                    skipOutHold: true,
                  }))
                }
                style={{ background: "inherit", cursor: "pointer" }}
              >
                Rapid
              </p>
            </div>
          </div>
          <SlidersContainer>
            <Slider
              min={1}
              max={10}
              value={state.inDuration}
              breathState={"inhale"}
              handleDurationChange={handleDurationChange}
            />
            <Slider
              min={0}
              max={10}
              value={state.inHoldDuration}
              breathState={"first breath hold"}
              handleDurationChange={handleDurationChange}
            />
            <Slider
              min={1}
              max={10}
              value={state.outDuration}
              breathState={"exhale"}
              handleDurationChange={handleDurationChange}
            />
            <Slider
              min={0}
              max={10}
              value={state.outHoldDuration}
              breathState={"second breath hold"}
              handleDurationChange={handleDurationChange}
            />
          </SlidersContainer>
        </Settings>
      </Header>
      <Canvas>
        <Stage width={state.size} height={state.size}>
          <Layer>
            <Rect width={state.size} height={state.size} fill="#00a6fb" />
            <Group x={state.size / 2} y={state.size / 2}>
              <Circle radius={state.radius} fill="#0582ca" />
              <Circle
                ref={circleRef}
                radius={state.radius / 2}
                fill="#006494"
              />
              <Text
                ref={textRef}
                fontFamily="Archivo"
                fontSize={16}
                text={state.text[state.current % 4]}
                align="center"
                verticalAlign="middle"
                x={-0.5 * (state.size / 2)}
                y={-0.5 * (state.size / 2)}
                height={state.size / 2}
                width={state.size / 2}
                fill="white"
                fontVariant="small-caps"
              />
            </Group>
          </Layer>
        </Stage>
      </Canvas>
      <Options>
        <p>
          {width > 500
            ? `You've spent ${displayTime()} breathing this session.`
            : `${displayTime()}`}
        </p>
        {setFullscreen &&
          (isFullscreen ? (
            <p
              style={{ textDecoration: "underline", userSelect: "none" }}
              onClick={handleExitFullscreen}
            >
              Close Fullscreen
            </p>
          ) : (
            <p
              style={{ textDecoration: "underline", userSelect: "none" }}
              className="pointer"
              onClick={setFullscreen}
            >
              Fullscreen Page
            </p>
          ))}
        <p
          style={{ textDecoration: "underline", userSelect: "none" }}
          onClick={() => setActive(!active)}
          className="pointer"
        >
          {active ? "Pause" : "Play"} Animation
        </p>
        {CanvasCapture.browserSupportsGIF() && (
          <Download
            progress={progress}
            isDownloading={state.isDownloading}
            downloadWasTriggered={state.downloadWasTriggered}
            handleDownload={handleDownload}
          />
        )}
      </Options>
    </div>
  );
};

export default App;
