import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  showArea?: boolean;
  animate?: boolean;
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  className,
  strokeColor = "rgb(59, 130, 246)",
  fillColor = "rgb(59, 130, 246)",
  strokeWidth = 1.5,
  showArea = true,
  animate = false,
}: SparklineProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const pathD = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `L ${point.x} ${point.y}`;
    })
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      {showArea && (
        <path
          d={areaD}
          fill={fillColor}
          fillOpacity="0.1"
          className={animate ? "animate-pulse" : ""}
        />
      )}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? "animate-pulse" : ""}
      />
    </svg>
  );
}
