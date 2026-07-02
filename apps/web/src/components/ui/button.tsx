import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-heading font-bold text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-glow-blue hover:bg-primary/90 hover:shadow-glow-blue active:scale-[0.98]",
        accent:
          "bg-accent text-accent-foreground shadow-glow-red hover:bg-accent/90 hover:shadow-glow-red active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white active:scale-[0.98]",
        "outline-accent":
          "border-2 border-accent bg-transparent text-accent hover:bg-accent hover:text-white active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent/10 hover:text-accent",
        "ghost-nav":
          "text-foreground/80 hover:text-foreground hover:bg-grey-light dark:hover:bg-white/10 rounded-lg",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
        glass:
          "glass text-white hover:bg-white/20 border border-white/20",
        navy:
          "bg-navy text-white hover:bg-navy/90 dark:bg-primary dark:hover:bg-primary/90",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs rounded-lg",
        lg: "h-14 px-8 text-base rounded-2xl",
        xl: "h-16 px-10 text-lg rounded-2xl",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Chargement…</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
