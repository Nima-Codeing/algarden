import type { ReactNode } from "react";

import { cn } from "../../../common/utils/cn.util";

type ButtonProps = {
  onClick?: () => unknown;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

export const Button = ({
  onClick,
  children,
  className = "",
  type = "button",
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100 transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
