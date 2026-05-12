import { useState, useCallback } from "react";
import { Popover, ColorPicker, Tabs, Slider, Button } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { Color } from "antd/es/color-picker";

// 颜色数据结构
// solid:   { type: 'solid', color: '#xxxxxx' }
// linear:  { type: 'linear', color: '#xxxxxx', gradient: { angle: 90, colorStops: [{color, offset},...] } }
// radial:  { type: 'radial', color: '#xxxxxx', gradient: { angle: 0,  colorStops: [{color, offset},...] } }

const DEFAULT_STOPS = [
  { color: "#ff0000", offset: 0 },
  { color: "#ffffff", offset: 1 },
];

/** 渐变预览条 */
function GradientBar({ colorStops, angle, type }: any) {
  const stops = [...colorStops].sort((a: any, b: any) => a.offset - b.offset);
  const stopsStr = stops
    .map((s: any) => `${s.color} ${s.offset * 100}%`)
    .join(", ");
  const bg =
    type === "radial"
      ? `radial-gradient(circle, ${stopsStr})`
      : `linear-gradient(${angle}deg, ${stopsStr})`;
  return (
    <div
      style={{
        width: "100%",
        height: 16,
        borderRadius: 4,
        background: bg,
        marginBottom: 10,
        border: "1px solid #e8e8e8",
      }}
    />
  );
}

/** 渐变色标列表 */
function ColorStopList({ colorStops, onChange }: any) {
  const updateStop = (idx: number, patch: any) => {
    const next = colorStops.map((s: any, i: number) =>
      i === idx ? { ...s, ...patch } : s,
    );
    onChange(next);
  };
  const addStop = () => {
    if (colorStops.length >= 8) return;
    onChange([...colorStops, { color: "#888888", offset: 0.5 }]);
  };
  const removeStop = (idx: number) => {
    if (colorStops.length <= 2) return;
    onChange(colorStops.filter((_: any, i: number) => i !== idx));
  };

  return (
    <div>
      {colorStops.map((stop: any, idx: number) => (
        <div
          key={idx}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          {/* 用 defaultValue 避免受控模式触发初始化 onChange */}
          <ColorPicker
            defaultValue={stop.color}
            format="hex"
            disabledAlpha
            onChangeComplete={(c: Color) =>
              updateStop(idx, { color: c.toHexString() })
            }
            size="small"
          />
          <Slider
            min={0}
            max={100}
            value={Math.round(stop.offset * 100)}
            onChange={(v) => updateStop(idx, { offset: v / 100 })}
            style={{ flex: 1 }}
            tooltip={{ formatter: (v: any) => `${v}%` }}
          />
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            disabled={colorStops.length <= 2}
            onClick={() => removeStop(idx)}
          />
        </div>
      ))}
      <Button
        type="dashed"
        size="small"
        icon={<PlusOutlined />}
        onClick={addStop}
        disabled={colorStops.length >= 8}
        block
      >
        添加色标
      </Button>
    </div>
  );
}

/** 渐变选择器面板 */
function GradientPicker({ value, onChange, type }: any) {
  const gradient = value?.gradient ?? { angle: 90, colorStops: DEFAULT_STOPS };

  const updateGradient = (patch: any) => {
    onChange({ ...value, type, gradient: { ...gradient, ...patch } });
  };

  return (
    <div style={{ width: 260 }}>
      <GradientBar
        colorStops={gradient.colorStops}
        angle={gradient.angle}
        type={type}
      />
      {type === "linear" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 12, color: "#666", whiteSpace: "nowrap" }}>
            角度
          </span>
          <Slider
            min={0}
            max={360}
            value={gradient.angle ?? 90}
            onChange={(v) => updateGradient({ angle: v })}
            style={{ flex: 1 }}
            tooltip={{ formatter: (v: any) => `${v}°` }}
          />
          <span style={{ fontSize: 12, color: "#666", minWidth: 30 }}>
            {gradient.angle ?? 90}°
          </span>
        </div>
      )}
      <ColorStopList
        colorStops={gradient.colorStops ?? DEFAULT_STOPS}
        onChange={(colorStops: any) => updateGradient({ colorStops })}
      />
    </div>
  );
}

/** 完整颜色选择器面板（内部用 local state，避免受控模式下的循环问题） */
function ColorPickerPanel({ initValue, defaultColor, onCommit }: any) {
  const [localValue, setLocalValue] = useState(
    () => initValue ?? { type: "solid", color: defaultColor },
  );

  const currentType = localValue?.type ?? "solid";

  const commit = useCallback(
    (v: any) => {
      setLocalValue(v);
      onCommit?.(v);
    },
    [onCommit],
  );

  const handleSolidChange = useCallback(
    (value: Color) => {
      // onChangeComplete 才触发，避免拖动中频繁回调
      const hex = value.toHexString();
      commit({ type: "solid", color: hex });
    },
    [commit],
  );

  const switchType = useCallback(
    (type: string) => {
      if (type === "solid") {
        commit({ type: "solid", color: localValue?.color ?? defaultColor });
      } else {
        commit({
          type,
          color: localValue?.color ?? defaultColor,
          gradient: localValue?.gradient ?? {
            angle: 90,
            colorStops: DEFAULT_STOPS,
          },
        });
      }
    },
    [localValue, defaultColor, commit],
  );

  const handleGradientChange = useCallback(
    (v: any) => {
      commit(v);
    },
    [commit],
  );

  const tabItems = [
    {
      key: "solid",
      label: "纯色",
      children: (
        <div style={{ padding: "8px 0" }}>
          <ColorPicker
            defaultValue={localValue?.color ?? defaultColor}
            format="hex"
            disabledAlpha
            onChangeComplete={handleSolidChange}
          />
        </div>
      ),
    },
    {
      key: "linear",
      label: "线性渐变",
      children: (
        <div style={{ padding: "8px 0" }}>
          <GradientPicker
            value={localValue}
            onChange={handleGradientChange}
            type="linear"
          />
        </div>
      ),
    },
    {
      key: "radial",
      label: "径向渐变",
      children: (
        <div style={{ padding: "8px 0" }}>
          <GradientPicker
            value={localValue}
            onChange={handleGradientChange}
            type="radial"
          />
        </div>
      ),
    },
  ];

  return (
    <Tabs
      activeKey={currentType}
      onChange={switchType}
      items={tabItems}
      size="small"
      style={{ width: 280 }}
    />
  );
}

// @TODO preset size
export default function ColorSetter(props) {
  const { defaultColor = "#ffffff", trigger, type, value, onChange } = props;

  const handleCommit = (v: any) => {
    if (!v) return;
    if (!v.color) v.color = defaultColor;
    onChange?.(v);
  };

  const calcIconFill = () => {
    switch (value?.type) {
      case "solid":
        return value.color;
      case "linear":
      case "radial":
        return `url(#colorsetter-icon-gradient) ${value.color || "rgba(0, 0, 0, 0.88)"}`;
      default:
        return "rgba(0, 0, 0, 0.88)";
    }
  };

  const calcTriggerBg = () => {
    if (value?.type === "solid") {
      const hex = (value.color ?? "").replace("#", "").toLowerCase();
      if (hex === "ffffff" || hex === "fff") {
        return "rgba(103,103,103,0.24)";
      }
    }
    return null;
  };

  const renderTrigger = () => {
    if (trigger) return trigger;
    if (type === "fontColor") {
      return (
        <svg
          viewBox="64 64 896 896"
          focusable="false"
          width={22}
          height={22}
          fill={calcIconFill()}
          aria-hidden="true"
        >
          <path d="M904 816H120c-4.4 0-8 3.6-8 8v80c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-80c0-4.4-3.6-8-8-8zm-650.3-80h85c4.2 0 8-2.7 9.3-6.8l53.7-166h219.2l53.2 166c1.3 4 5 6.8 9.3 6.8h89.1c1.1 0 2.2-.2 3.2-.5a9.7 9.7 0 006-12.4L573.6 118.6a9.9 9.9 0 00-9.2-6.6H462.1c-4.2 0-7.9 2.6-9.2 6.6L244.5 723.1c-.4 1-.5 2.1-.5 3.2-.1 5.3 4.3 9.7 9.7 9.7zm255.9-516.1h4.1l83.8 263.8H424.9l84.7-263.8z"></path>
        </svg>
      );
    }
    return (
      <svg
        width={22}
        height={22}
        viewBox="64 64 896 896"
        focusable="false"
        fill={calcIconFill()}
        aria-hidden="true"
      >
        <path d="M766.4 744.3c43.7 0 79.4-36.2 79.4-80.5 0-53.5-79.4-140.8-79.4-140.8S687 610.3 687 663.8c0 44.3 35.7 80.5 79.4 80.5zm-377.1-44.1c7.1 7.1 18.6 7.1 25.6 0l256.1-256c7.1-7.1 7.1-18.6 0-25.6l-256-256c-.6-.6-1.3-1.2-2-1.7l-78.2-78.2a9.11 9.11 0 00-12.8 0l-48 48a9.11 9.11 0 000 12.8l67.2 67.2-207.8 207.9c-7.1 7.1-7.1 18.6 0 25.6l255.9 256zm12.9-448.6l178.9 178.9H223.4l178.8-178.9zM904 816H120c-4.4 0-8 3.6-8 8v80c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-80c0-4.4-3.6-8-8-8z"></path>
      </svg>
    );
  };

  // Popover 打开时用 key 强制重新挂载 Panel，读取最新 value 作为初始值
  const [popKey, setPopKey] = useState(0);

  const handleOpenChange = (open: boolean) => {
    if (open) setPopKey((k) => k + 1);
  };

  return (
    <>
      <Popover
        content={
          <div className="fabritor-color-setter">
            <ColorPickerPanel
              key={popKey}
              initValue={value}
              defaultColor={defaultColor}
              onCommit={handleCommit}
            />
          </div>
        }
        trigger="click"
        onOpenChange={handleOpenChange}
      >
        <div
          className="fabritor-toolbar-item"
          style={{
            borderRadius: 4,
            backgroundColor: calcTriggerBg(),
          }}
        >
          {renderTrigger()}
        </div>
      </Popover>

      <svg
        style={{ width: 0, height: 0, position: "absolute" }}
        aria-hidden="true"
        focusable="false"
      >
        <linearGradient id="colorsetter-icon-gradient" x2="1" y2="1">
          {value?.gradient?.colorStops?.map((stop: any, i: number) => (
            <stop
              key={i}
              offset={`${stop.offset * 100}%`}
              stopColor={stop.color}
            />
          ))}
        </linearGradient>
      </svg>
    </>
  );
}
