import type { ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const useStyles = tv({
  base: "no-scrollbar overflow-y-auto scroll-smooth p-4",
  variants: {
    fullScreen: {
      true: "container mx-auto h-full max-w-2xl",
    },
  },
});

export function BookContainer({
  className,
  fullScreen,
  ...props
}: ComponentPropsWithRef<"section"> & VariantProps<typeof useStyles>) {
  const styles = useStyles({ className, fullScreen });

  return <section {...props} className={styles} />;
}
