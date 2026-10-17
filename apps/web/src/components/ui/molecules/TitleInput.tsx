import type { ComponentPropsWithoutRef } from "react";

import { cn } from "../../../common/utils/cn.util";
import { Text } from "../atoms/Text";

const variants = {
  col: "flex flex-col gap-2",
  row: "flex flex-row gap-2",
} as const;

type TitleInputProps = {
  id: string;
  label: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  variant?: keyof typeof variants;
} & Omit<ComponentPropsWithoutRef<"input">, "id" | "className">;

export const TitleInput = ({
  id,
  label,
  className = "",
  labelClassName = "",
  inputClassName = "",
  variant = "col",
  ...inputProps
}: TitleInputProps) => {
  return (
    <div className={cn(variants[variant], className)}>
      <Text
        as="label"
        htmlFor={id}
        className={cn("flex items-start text-sm", labelClassName)}
      >
        {label}
      </Text>
      <input
        id={id}
        className={cn("border border-white/20 rounded-md p-1", inputClassName)}
        {...inputProps}
      />
    </div>
  );
};
