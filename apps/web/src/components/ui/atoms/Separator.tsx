import { cn } from "../../../common/utils/cn.util";

export const Separator = ({
  className = "bg-slate-200 dark:bg-slate-800",
}: {
  className?: string;
}) => {
  return <div className={cn("h-[1px] w-full", className)}></div>;
};
