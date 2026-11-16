import type { ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const useStyles = tv({
  base: "h-full overflow-y-scroll scroll-smooth",
});

export function BookContainer({
  className,
  ...props
}: ComponentPropsWithRef<"section"> & VariantProps<typeof useStyles>) {
  const styles = useStyles({ className });

  return <section {...props} className={styles} />;
}
