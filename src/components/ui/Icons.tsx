import type { SVGProps } from 'react';
import type { Category } from '@/lib/types';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function SvgIcon({ size = 16, viewBox = '0 0 24 24', strokeWidth = 1.9, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </SvgIcon>
  );
}

export function CreditCardIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 10.5h18" />
      <path d="M7 15h4" />
    </SvgIcon>
  );
}

export function BotIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 4v3" />
      <rect x="5" y="7" width="14" height="11" rx="4" />
      <path d="M8 18v2" />
      <path d="M16 18v2" />
      <path d="M5 11H3" />
      <path d="M21 11h-2" />
      <circle cx="10" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="12" r="1" fill="currentColor" stroke="none" />
      <path d="M9 15h6" />
    </SvgIcon>
  );
}

export function MapIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M9 18 3.8 20.2A.6.6 0 0 1 3 19.65V6.5a1 1 0 0 1 .62-.92L9 3" />
      <path d="m9 3 6 3" />
      <path d="m15 6 5.2-2.2a.6.6 0 0 1 .8.55v13.15a1 1 0 0 1-.62.92L15 21" />
      <path d="M9 3v15" />
      <path d="M15 6v15" />
    </SvgIcon>
  );
}

export function MessageIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M7 18.5 3 21V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </SvgIcon>
  );
}

export function CloudSunIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M14 5a4 4 0 0 0-3.87 3H10a4.5 4.5 0 0 0 0 9h8a3.5 3.5 0 1 0-.64-6.94A5 5 0 0 0 14 5Z" />
      <path d="M6 8V5" />
      <path d="M3.5 10.5 2 9" />
      <path d="M9 10.5 10.5 9" />
    </SvgIcon>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16v-4" />
      <path d="M12 16V8" />
      <path d="M16 16v-6" />
      <path d="M20 16v-9" />
    </SvgIcon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3 5 6v5c0 4.5 2.9 8.5 7 10 4.1-1.5 7-5.5 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.3-3.7" />
    </SvgIcon>
  );
}

export function DatabaseIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
      <path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
    </SvgIcon>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </SvgIcon>
  );
}

export function StorageIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 7a8 8 0 0 1 15.4-2.8A5 5 0 1 1 19 19H7a4 4 0 1 1 .6-7.95A6 6 0 0 1 13 7" />
      <path d="M12 11v6" />
      <path d="m9.5 14.5 2.5 2.5 2.5-2.5" />
    </SvgIcon>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M8.6 3h6.8a1.6 1.6 0 0 1 1.6 1.6v14.8a1.6 1.6 0 0 1-1.6 1.6H8.6A1.6 1.6 0 0 1 7 19.4V4.6A1.6 1.6 0 0 1 8.6 3Z" />
      <path d="M10 6h4" />
      <path d="M12 18h.01" />
    </SvgIcon>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3Z" />
      <path d="m18 13 .8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8L18 13Z" />
      <path d="m6 14 .9 2.1L9 17l-2.1.9L6 20l-.9-2.1L3 17l2.1-.9L6 14Z" />
    </SvgIcon>
  );
}

export function BookmarkIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M7 4.5A1.5 1.5 0 0 1 8.5 3h7A1.5 1.5 0 0 1 17 4.5V21l-5-3-5 3V4.5Z" />
    </SvgIcon>
  );
}

export function BookmarkFilledIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M8.5 3A1.5 1.5 0 0 0 7 4.5V21l5-3 5 3V4.5A1.5 1.5 0 0 0 15.5 3h-7Z" />
    </svg>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3c1 3-1 4.3-1 6.3 0 1.8 1.4 2.7 1.4 4.5 0 1.4-.8 2.6-2 3.2" />
      <path d="M13 7c3 1.8 5 4.6 5 8a6 6 0 1 1-12 0c0-2.5 1.2-4.5 3-6" />
    </SvgIcon>
  );
}

export function KeyIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="8.5" cy="15.5" r="3.5" />
      <path d="M12 15.5h9" />
      <path d="M18 15.5v-3" />
      <path d="M15 15.5v2" />
    </SvgIcon>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="8" r="3.3" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </SvgIcon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8.5A4 4 0 0 1 12 4.5a4 4 0 0 1 4 4V11" />
      <path d="M12 14.5v3" />
    </SvgIcon>
  );
}

export function BookOpenIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21V5.5Z" />
    </SvgIcon>
  );
}

export function PackageIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m12 3 7 4-7 4-7-4 7-4Z" />
      <path d="M5 7v10l7 4 7-4V7" />
      <path d="M12 11v10" />
    </SvgIcon>
  );
}

export function WrenchIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M14.5 6.5a4 4 0 0 0-5.18 5.18L4 17v3h3l5.32-5.32a4 4 0 0 0 5.18-5.18l-2.5 2.5-2-2 2.5-2.5Z" />
    </SvgIcon>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </SvgIcon>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
    </SvgIcon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m5 12 4 4L19 6" />
    </SvgIcon>
  );
}

export function StarIcon({ fill = 'none', ...props }: IconProps) {
  return (
    <SvgIcon {...props} fill={fill}>
      <path d="m12 3.8 2.53 5.12 5.65.82-4.09 3.98.97 5.62L12 16.7l-5.06 2.64.97-5.62-4.09-3.98 5.65-.82L12 3.8Z" />
    </SvgIcon>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M14 5h6v6" />
      <path d="M20 4 10 14" />
      <path d="M19 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" />
    </SvgIcon>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2" />
      <path d="M12 19.3v2.2" />
      <path d="m4.93 4.93 1.56 1.56" />
      <path d="m17.51 17.51 1.56 1.56" />
      <path d="M2.5 12h2.2" />
      <path d="M19.3 12h2.2" />
      <path d="m4.93 19.07 1.56-1.56" />
      <path d="m17.51 6.49 1.56-1.56" />
    </SvgIcon>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 1 0 10.5 10.5Z" />
    </SvgIcon>
  );
}

export function CategoryIcon({ categoryId, ...props }: IconProps & { categoryId: Category['id'] }) {
  switch (categoryId) {
    case 'payments':
      return <CreditCardIcon {...props} />;
    case 'ai':
      return <BotIcon {...props} />;
    case 'maps':
      return <MapIcon {...props} />;
    case 'messaging':
      return <MessageIcon {...props} />;
    case 'weather':
      return <CloudSunIcon {...props} />;
    case 'finance':
      return <ChartIcon {...props} />;
    case 'auth':
      return <ShieldIcon {...props} />;
    case 'data':
      return <DatabaseIcon {...props} />;
    case 'social':
      return <GlobeIcon {...props} />;
    case 'storage':
      return <StorageIcon {...props} />;
    case 'search':
      return <SearchIcon {...props} />;
    case 'comms':
      return <PhoneIcon {...props} />;
    default:
      return <GlobeIcon {...props} />;
  }
}
