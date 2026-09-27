import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "../../../common/utils/cn";

type TextProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export const Text = <T extends ElementType = "span">({
  as,
  children,
  className,
  ...props
}: TextProps<T>) => {
  const Component = as || "span";
  return (
    <Component
      className={cn("antialiased tracking-normal leading-relaxed", className)}
      {...props}
    >
      {children}
    </Component>
  );
};
