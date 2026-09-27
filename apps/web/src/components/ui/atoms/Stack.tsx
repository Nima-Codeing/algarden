import type { ReactNode } from "react";

interface StackProps {
  direction: "col" | "row";
  children: ReactNode;
  className?: string;
}

export const Stack = ({ direction, children, className = "" }: StackProps) => {
  return (
    <ul
      className={`flex ${direction === "col" ? "flex-col" : "flex-row"} ${className}`}
    >
      {children}
    </ul>
  );
};
