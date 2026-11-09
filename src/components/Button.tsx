import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'text';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'rounded-full bg-pink-ink px-7 py-3 text-white shadow-[0_10px_24px_-10px_rgb(217_67_131/0.9)] hover:bg-[#962356] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:bg-[#b98aa3] disabled:shadow-none',
  secondary:
    'rounded-full border-2 border-purple-deep/25 bg-white px-6 py-2.5 text-purple-deep shadow-soft hover:border-purple-deep/50 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60',
  text: 'rounded-lg px-3 py-2 text-purple-deep underline decoration-2 underline-offset-4 hover:decoration-pink-deep hover:text-ink disabled:opacity-60',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export function Button({ variant = 'primary', className = '', type = 'button', children, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 font-display text-lg font-semibold transition duration-200 disabled:cursor-not-allowed disabled:translate-y-0 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
