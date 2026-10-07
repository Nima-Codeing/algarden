import type { ReactNode } from "react";

import { cn } from "../../../common/utils/cn.util";

const variants = {
  rounded: "rounded-lg",
  square: "",
} as const;

type CardVariant = keyof typeof variants;

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
}

export const Card = ({
  children,
  className = "",
  variant = "square",
}: CardProps) => {
  return (
    <div
      className={cn(
        "bg-white w-full",
        className,
        variants[variant],
      )}
    >
      {children}
    </div>
  );
};
