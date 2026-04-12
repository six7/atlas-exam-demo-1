import { Button as ShadButton, buttonVariants } from "@/src/components/ui/button";
import type { ButtonProps as ShadButtonProps } from "@/src/components/ui/button";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<ShadButtonProps, "variant" | "size"> {
  variant?: Variant;
  size?: Size;
}

const variantMap: Record<Variant, ShadButtonProps["variant"]> = {
  primary: "default",
  secondary: "secondary",
  ghost: "ghost",
};

const sizeMap: Record<Size, ShadButtonProps["size"]> = {
  sm: "sm",
  md: "default",
  lg: "lg",
};

export function Button({ variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <ShadButton
      variant={variantMap[variant]}
      size={sizeMap[size]}
      {...props}
    />
  );
}

export { buttonVariants };
