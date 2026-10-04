import type { ImgHTMLAttributes } from 'react';

export interface DigitalIndiaLogoProps extends ImgHTMLAttributes<HTMLImageElement> {
  variant?: 'white' | 'dark';
}

/**
 * Official Digital India Logo (डिजिटल भारत - Power To Empower)
 * Official MeitY vector branding
 */
export function DigitalIndiaLogo({
  className = 'h-9 w-auto',
  variant = 'white',
  style,
  ...props
}: DigitalIndiaLogoProps) {
  const src = variant === 'dark' ? '/digital-india.svg' : '/digital-india-white.svg';

  return (
    <img
      src={src}
      alt="Digital India (डिजिटल भारत - Power To Empower)"
      className={`object-contain shrink-0 select-none ${className}`}
      style={{ aspectRatio: '190.39 / 100.2', ...style }}
      loading="eager"
      decoding="async"
      {...props}
    />
  );
}

/**
 * Official Azadi Ka Amrit Mahotsav (75 Years of Progressive India) Emblem
 * Authentic Ministry of Culture insignia with 75 Chakra & Tricolor Ribbon
 */
export function AzadiMahotsavLogo({
  className = 'h-9 w-auto',
  style,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/azadi-mahotsav.png"
      alt="Azadi Ka Amrit Mahotsav (1947-2022)"
      className={`object-contain shrink-0 select-none brightness-110 drop-shadow-xs ${className}`}
      style={{ aspectRatio: '1024 / 583', ...style }}
      loading="eager"
      decoding="async"
      {...props}
    />
  );
}

/**
 * Official National Informatics Centre (NIC) Logo
 * Ministry of Electronics & IT, Government of India
 */
export function NICLogo({
  className = 'h-7 w-auto',
  style,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/nic-logo.svg"
      alt="National Informatics Centre (NIC)"
      className={`object-contain shrink-0 select-none ${className}`}
      style={{ aspectRatio: '1172 / 321', ...style }}
      loading="eager"
      decoding="async"
      {...props}
    />
  );
}

/**
 * GIGW 3.0 / STQC Certified Compliance Badge
 */
export function GIGWBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`h-10 border border-slate-200 bg-white px-3 py-1.5 rounded-md shadow-2xs flex items-center justify-center gap-1.5 shrink-0 hover:border-slate-300 transition-colors text-[11px] text-slate-700 font-semibold ${className}`}>
      <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" aria-hidden="true" />
      <span className="font-bold text-[#132F4C]">GIGW 3.0</span>
      <span className="text-slate-300" aria-hidden="true">|</span>
      <span>STQC Certified</span>
    </div>
  );
}

/**
 * Official india.gov.in National Portal of India badge
 */
export function IndiaGovBadge({ className = '' }: { className?: string }) {
  return (
    <a
      href="https://www.india.gov.in"
      target="_blank"
      rel="noopener noreferrer"
      className={`h-10 border border-slate-200 bg-white px-3 py-1.5 rounded-md shadow-2xs flex items-center justify-center gap-1.5 shrink-0 hover:border-slate-300 transition-colors cursor-pointer ${className}`}
      title="National Portal of India (india.gov.in)"
    >
      <span className="font-bold text-xs tracking-tight text-[#132F4C]">india<span className="text-[#f2b134]">.gov</span>.in</span>
      <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">National Portal</span>
    </a>
  );
}



