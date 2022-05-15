import React from "react";

export default function Download(props) {
  if (!props.progress) {
    if (props.downloadWasTriggered) {
      return (
        <p style={{ textDecoration: "underline", userSelect: "none" }}>
          Preparing download . . .
        </p>
      );
    } else {
      return (
        <p
          style={{ textDecoration: "underline", userSelect: "none" }}
          className="pointer"
          onClick={props.handleDownload}
        >
          {" "}
          Download as GIF
        </p>
      );
    }
  } else if (props.progress !== 1) {
    return (
      <p style={{ textDecoration: "underline", userSelect: "none" }}>
        Download {Math.floor(props.progress * 100)}% complete
      </p>
    );
  } else {
    return (
      <p style={{ textDecoration: "underline", userSelect: "none" }}>
        Download complete.
      </p>
    );
  }
}
