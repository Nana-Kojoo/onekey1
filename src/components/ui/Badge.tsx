import { ReactNode } from 'react';

type BadgeVariant = 'gray' | 'green' | 'blue' | 'dark' | 'amber';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

export function Badge({ children, variant = 'gray' }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
