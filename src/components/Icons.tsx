import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export const JarMark = (props: SVGProps<SVGSVGElement>) => (
  <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden focusable={false} {...props}>
    <rect x="9" y="3" width="14" height="6" rx="2" fill="#E8AD2B" />
    <path d="M8 11c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v15a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3z" fill="#A34230" />
    <rect x="8" y="14" width="16" height="9" fill="#2D5016" />
    <rect x="11" y="17" width="10" height="3" rx="1.5" fill="#FAF7F0" />
  </svg>
);

export const MenuIcon = () => (
  <svg {...base} width={24} height={24}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const CloseIcon = () => (
  <svg {...base} width={24} height={24}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const PinIcon = () => (
  <svg {...base}>
    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.800 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
export const PhoneIcon = () => (
  <svg {...base}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);
export const MailIcon = () => (
  <svg {...base}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);
export const ChatIcon = () => (
  <svg {...base}>
    <path d="M20 11.5a8 8 0 0 1-11.800 7L4 20l1.5-4.200A8 8 0 1 1 20 11.5z" />
  </svg>
);
export const CheckIcon = () => (
  <svg {...base} strokeWidth={2.4}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
