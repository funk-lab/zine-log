import { useState, useRef, useEffect } from "react";

interface SizeInputProps {
  width: number;
  height: number;
  onApply: (width: number, height: number) => void;
  min?: number;
  max?: number;
  widthLabel?: string;
  heightLabel?: string;
  defaultLinked?: boolean;
  rowStyle?: React.CSSProperties;
}

export default function SizeInput({
  width: propWidth,
  height: propHeight,
  onApply,
  min,
  max,
  widthLabel = "宽 W",
  heightLabel = "高 H",
  defaultLinked = true,
  rowStyle,
}: SizeInputProps) {
  const [width, setWidth] = useState(propWidth);
  const [height, setHeight] = useState(propHeight);
  const [linked, setLinked] = useState(defaultLinked);
  const linkedRatioRef = useRef(propWidth / propHeight || 1);

  useEffect(() => {
    setWidth(propWidth);
    setHeight(propHeight);
    if (linked) {
      linkedRatioRef.current = propWidth / propHeight || 1;
    }
  }, [propWidth, propHeight, linked]);

  const handleLinkToggle = () => {
    const next = !linked;
    if (next) {
      linkedRatioRef.current = width / height || 1;
    }
    setLinked(next);
  };

  const handleWidthBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newW = Number(e.target.value);
    if (linked) {
      const newH = Math.round(newW / linkedRatioRef.current);
      setHeight(newH);
      setWidth(newW);
      onApply(newW, newH);
    } else {
      setWidth(newW);
      onApply(newW, height);
    }
  };

  const handleHeightBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newH = Number(e.target.value);
    if (linked) {
      const newW = Math.round(newH * linkedRatioRef.current);
      setWidth(newW);
      setHeight(newH);
      onApply(newW, newH);
    } else {
      setHeight(newH);
      onApply(width, newH);
    }
  };

  return (
    <div className="zine-form-row" style={rowStyle}>
      <div className="zine-form-group">
        <label className="zine-form-label">{widthLabel}</label>
        <input
          type="number"
          className="zine-num-input"
          value={width}
          min={min}
          max={max}
          onChange={(e) => setWidth(Number(e.target.value))}
          onBlur={handleWidthBlur}
        />
      </div>
      <button
        className={`zine-size-link-btn ${linked ? "linked" : ""}`}
        onClick={handleLinkToggle}
        title="锁定比例"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
      <div className="zine-form-group">
        <label className="zine-form-label">{heightLabel}</label>
        <input
          type="number"
          className="zine-num-input"
          value={height}
          min={min}
          max={max}
          onChange={(e) => setHeight(Number(e.target.value))}
          onBlur={handleHeightBlur}
        />
      </div>
    </div>
  );
}
