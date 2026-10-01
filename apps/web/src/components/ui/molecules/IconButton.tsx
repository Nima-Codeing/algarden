import type { LucideIcon } from "lucide-react";

import { Icon } from "../atoms/Icon";
import { Button } from "../atoms/Button";
import { cn } from "../../../common/utils/cn.util";

const variants = {
  circle: "rounded-full p-2",
  round: "rounded-md p-2",
  square: "rounded-none p-2",
  none: "border-none p-2",
} as const;

type IconButtonProps = {
  icon: LucideIcon;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: keyof typeof variants;
  className?: string;
  iconClassName?: string;
  onClick?: () => unknown;
};

export const IconButton = ({
  icon,
  type = "button",
  disabled = false,
  variant = "square",
  className = "",
  iconClassName = "",
  onClick,
}: IconButtonProps) => {
  return (
    <Button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center min-w-[20px] min-h-[20px]",
        className,
        variants[variant],
      )}
    >
      <Icon icon={icon} className={iconClassName} />
    </Button>
  );
};
