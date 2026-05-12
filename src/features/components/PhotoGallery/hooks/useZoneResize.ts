import { useState, useEffect, useRef } from "react";

interface UseZoneResizeReturn {
  zoneHeights: {
    unselected: number;
    selected: number;
  };
  setZoneHeights: React.Dispatch<React.SetStateAction<{
    unselected: number;
    selected: number;
  }>>;
  zoneUnselectedRef: React.RefObject<HTMLDivElement | null>;
  zoneSelectedRef: React.RefObject<HTMLDivElement | null>;
  dividerRef: React.RefObject<HTMLDivElement | null>;
}

export const useZoneResize = (containerRef: React.RefObject<HTMLDivElement | null>): UseZoneResizeReturn => {
  const [zoneHeights, setZoneHeights] = useState<{
    unselected: number;
    selected: number;
  }>({
    unselected: 50,
    selected: 50,
  });

  const zoneUnselectedRef = useRef<HTMLDivElement>(null);
  const zoneSelectedRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  useEffect(() => {
    const divider = dividerRef.current;
    const container = containerRef.current;
    if (!divider || !container) return;

    const handleMouseDown = (e: MouseEvent) => {
      isResizingRef.current = true;
      const startY = e.clientY;
      const containerHeight = container.getBoundingClientRect().height;
      const zoneUnselected = zoneUnselectedRef.current;
      const zoneSelected = zoneSelectedRef.current;

      if (!zoneUnselected || !zoneSelected) return;

      const startUnselectedHeight = zoneUnselected.getBoundingClientRect().height;
      const startSelectedHeight = zoneSelected.getBoundingClientRect().height;

      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";

      const handleMouseMove = (mv: MouseEvent) => {
        if (!isResizingRef.current) return;
        const dy = mv.clientY - startY;
        const minHeight = 80;

        const newUnselectedHeight = Math.max(minHeight, startUnselectedHeight + dy);
        const newSelectedHeight = Math.max(minHeight, startSelectedHeight - dy);

        const totalHeight = newUnselectedHeight + newSelectedHeight + 6;

        if (totalHeight <= containerHeight) {
          const unselectedPercent =
            (newUnselectedHeight / (newUnselectedHeight + newSelectedHeight)) * 100;
          setZoneHeights({
            unselected: unselectedPercent,
            selected: 100 - unselectedPercent,
          });
        }
      };

      const handleMouseUp = () => {
        isResizingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    divider.addEventListener("mousedown", handleMouseDown);
    return () => divider.removeEventListener("mousedown", handleMouseDown);
  }, [containerRef]);

  return {
    zoneHeights,
    setZoneHeights,
    zoneUnselectedRef,
    zoneSelectedRef,
    dividerRef,
  };
};
