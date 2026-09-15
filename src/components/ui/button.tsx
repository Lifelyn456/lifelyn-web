import type { ButtonHTMLAttributes } from "react";

type Variant = "solid" | "outline" | "danger";

const CLASS_BY_VARIANT: Record<Variant, string> = {
  solid: "button",
  outline: "button button-outline",
  danger: "danger-button",
};

export function Button({
  variant = "solid",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const classes = [CLASS_BY_VARIANT[variant], className].filter(Boolean).join(" ");
  return <button className={classes} {...props} />;
}
