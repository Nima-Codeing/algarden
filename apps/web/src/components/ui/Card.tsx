import type { ReactNode } from "react";

type Props = {
    className?: string;
    children: ReactNode;
}

export const Card = ({ className, children }: Props) => {
  return (
  <div className={`rounded-lg bg-sky-500 ${className}`}>
    {children}
  </div>
);
};
