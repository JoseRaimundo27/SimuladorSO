import React from "react";
import "./style.css";

const TimelineBlock = ({ state, index }) => {
  const getClassName = (state) => {
    switch (state) {
      case "execute":
        return "green";
      case "wait":
        return "yellow";
      case "idle":
        return "light-gray";
      case "completed":
        return "dark-gray";
      default:
        return "";
    }
  };

  return (
    <div
      key={index}
      className={`timeline-block ${getClassName(state)}`}
      style={{ animationDelay: `${index * 0.5}s` }}
    >
      {index}
    </div>
  );
};

export default TimelineBlock;
