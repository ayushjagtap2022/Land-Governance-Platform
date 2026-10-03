import type { SVGProps } from 'react';

interface IndiaFlagProps extends SVGProps<SVGSVGElement> {
  className?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * Official Flag of India (Tiranga) with the 24-spoke Ashoka Chakra.
 * Standard 3:2 aspect ratio with authentic saffron, white, green, and navy blue colors.
 */
export function IndiaFlag({
  className = 'h-4 w-6 shadow-xs border border-slate-300 rounded-[1px] inline-block shrink-0',
  width = 24,
  height = 16,
  style,
  ...props
}: IndiaFlagProps) {
  // Pre-computed 24 spokes at 15-degree intervals
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 16"
      className={className}
      width={width}
      height={height}
      style={{ aspectRatio: '3 / 2', objectFit: 'contain', ...style }}
      aria-label="Flag of India with Ashoka Chakra"
      role="img"
      {...props}
    >
      {/* Top Band: India Saffron */}
      <rect x="0" y="0" width="24" height="5.333" fill="#FF9933" />

      {/* Middle Band: White */}
      <rect x="0" y="5.333" width="24" height="5.334" fill="#FFFFFF" />

      {/* Bottom Band: India Green */}
      <rect x="0" y="10.667" width="24" height="5.333" fill="#138808" />

      {/* Ashoka Chakra in the center of the white band */}
      <g transform="translate(12, 8)">
        {/* Outer Circular Rim */}
        <circle r="2.1" fill="none" stroke="#000080" strokeWidth="0.4" />

        {/* Central Hub Circle */}
        <circle r="0.45" fill="#000080" />

        {/* 24 Spoke Lines */}
        {spokes.map((deg) => (
          <line
            key={`spoke-${deg}`}
            x1="0"
            y1="0"
            x2="0"
            y2="-2.1"
            stroke="#000080"
            strokeWidth="0.22"
            transform={`rotate(${deg})`}
          />
        ))}

        {/* 24 Decorative Circular Beads around the rim between spokes */}
        {spokes.map((deg) => (
          <circle
            key={`bead-${deg}`}
            cx="0"
            cy="-1.85"
            r="0.14"
            fill="#000080"
            transform={`rotate(${deg + 7.5})`}
          />
        ))}
      </g>
    </svg>
  );
}

export default IndiaFlag;
