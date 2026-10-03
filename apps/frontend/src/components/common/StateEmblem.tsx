import type { HTMLAttributes } from 'react';

export interface StateEmblemProps extends HTMLAttributes<HTMLImageElement> {
  variant?: 'gold' | 'white' | 'dark';
}

/**
 * Official State Emblem of India (Lion Capital of Ashoka with "सत्यमेव जयते")
 * Authentic vector representation for official Government of India web portals.
 */
export function StateEmblem({
  variant = 'gold',
  className = 'h-12 w-auto',
  style,
  ...props
}: StateEmblemProps) {
  const src =
    variant === 'gold'
      ? '/emblem-of-india-gold.svg'
      : variant === 'white'
        ? '/emblem-of-india-white.svg'
        : '/emblem-of-india-dark.svg';

  return (
    <img
      src={src}
      alt="State Emblem of India (Lion Capital of Ashoka with Satyameva Jayate)"
      className={`object-contain select-none pointer-events-none ${className}`}
      style={{ aspectRatio: '145.52 / 231.92', ...style }}
      loading="eager"
      decoding="async"
      {...props}
    />
  );
}

