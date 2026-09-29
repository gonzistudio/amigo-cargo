// Iconos como SVG en línea (sin depender de glifos Unicode / emoji, que
// algunos dispositivos y navegadores no renderizan igual o muestran a color
// como si fueran emoji). Todos heredan el color del texto (currentColor).

type IconProps = { className?: string };

const base = {
  width: 14,
  height: 14,
  viewBox: "0 0 14 14",
  fill: "none" as const,
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
};

export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 10L10 4M10 4H5.2M10 4V8.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7 3V11M7 11L3.5 7.5M7 11L10.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowUpIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7 11V3M7 3L3.5 6.5M7 3L10.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 7H11.5M11.5 7L8 3.5M11.5 7L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2.8 7.3L5.4 9.9L11.2 4.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const flagBase = {
  width: 28,
  height: "auto" as const,
  viewBox: "0 0 30 20",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
};

export function ChinaFlagIcon({ className }: IconProps) {
  return (
    <svg {...flagBase} className={className}>
      <rect width="30" height="20" fill="#DE2910" />
      <polygon
        fill="#FFDE00"
        points="7.5,1.8 8.23,4.0 10.54,4.01 8.68,5.38 9.38,7.59 7.5,6.24 5.62,7.59 6.32,5.38 4.46,4.01 6.77,4.0"
      />
      <polygon
        fill="#FFDE00"
        points="12.55,2.64 13.1,2.12 12.78,1.43 13.45,1.79 14.01,1.28 13.87,2.03 14.53,2.4 13.78,2.5 13.63,3.24 13.3,2.56"
      />
      <polygon
        fill="#FFDE00"
        points="14.75,4.65 15.46,4.38 15.43,3.62 15.91,4.2 16.62,3.94 16.21,4.58 16.68,5.18 15.95,4.98 15.52,5.61 15.48,4.86"
      />
      <polygon
        fill="#FFDE00"
        points="14.03,7.61 14.78,7.65 15.07,6.95 15.26,7.69 16.02,7.74 15.38,8.15 15.56,8.89 14.97,8.41 14.33,8.81 14.6,8.1"
      />
      <polygon
        fill="#FFDE00"
        points="11.42,8.5 12.11,8.8 12.62,8.24 12.55,8.99 13.24,9.31 12.51,9.47 12.42,10.23 12.03,9.58 11.29,9.73 11.79,9.16"
      />
    </svg>
  );
}

const venezuelaStars = [
  "9.87,9.05 10.06,9.64 10.68,9.64 10.18,10.01 10.37,10.59 9.87,10.23 9.37,10.59 9.56,10.01 9.06,9.64 9.68,9.64",
  "11.3,8.61 11.49,9.2 12.11,9.2 11.61,9.57 11.8,10.15 11.3,9.79 10.8,10.15 10.98,9.57 10.49,9.2 11.1,9.2",
  "12.76,8.32 12.96,8.9 13.57,8.9 13.08,9.27 13.26,9.86 12.76,9.5 12.26,9.86 12.45,9.27 11.96,8.9 12.57,8.9",
  "14.25,8.17 14.45,8.75 15.06,8.76 14.57,9.12 14.75,9.71 14.25,9.35 13.75,9.71 13.94,9.12 13.44,8.76 14.06,8.75",
  "15.75,8.17 15.94,8.75 16.56,8.76 16.06,9.12 16.25,9.71 15.75,9.35 15.25,9.71 15.43,9.12 14.94,8.76 15.55,8.75",
  "17.24,8.32 17.43,8.9 18.04,8.9 17.55,9.27 17.74,9.86 17.24,9.5 16.74,9.86 16.92,9.27 16.43,8.9 17.04,8.9",
  "18.7,8.61 18.9,9.2 19.51,9.2 19.02,9.57 19.2,10.15 18.7,9.79 18.2,10.15 18.39,9.57 17.89,9.2 18.51,9.2",
  "20.13,9.05 20.32,9.64 20.94,9.64 20.44,10.01 20.63,10.59 20.13,10.23 19.63,10.59 19.82,10.01 19.32,9.64 19.94,9.64",
];

export function VenezuelaFlagIcon({ className }: IconProps) {
  return (
    <svg {...flagBase} className={className}>
      <rect width="30" height="6.667" fill="#FCD116" />
      <rect y="6.667" width="30" height="6.667" fill="#003893" />
      <rect y="13.333" width="30" height="6.667" fill="#CF142B" />
      {venezuelaStars.map((points) => (
        <polygon key={points} fill="#fff" points={points} />
      ))}
    </svg>
  );
}
