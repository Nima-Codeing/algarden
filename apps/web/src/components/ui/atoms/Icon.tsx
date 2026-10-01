import { type LucideIcon } from "lucide-react";

import { cn } from "../../../common/utils/cn.util";

interface IconProps {
  icon: LucideIcon;
  className?: string;
}

const defaultStyle = "text-gray-800 w-[14px] h-[14px]";

export const Icon = ({ icon: IconComponent, className = "" }: IconProps) => {
  return <IconComponent className={cn(defaultStyle, className)} />;
};
