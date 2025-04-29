import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

// Since @radix-ui/react-dialog is not available, we'll create a simple dialog component
const Dialog = ({ children, open, onOpenChange }) => {
  if (!open) return null;
  
  React.useEffect(() => {
    // Prevent scrolling when dialog is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="z-50 relative">{children}</div>
    </div>
  );
};

const DialogTrigger = ({ asChild, children, onClick, ...props }) => {
  if (asChild) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e) => {
        onClick?.(e);
        children.props.onClick?.(e);
      }
    });
  }
  return <button onClick={onClick} {...props}>{children}</button>;
};

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-right",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

const DialogClose = ({ className, children, onClick, ...props }) => (
  <button
    className={cn(
      "absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100",
      className
    )}
    onClick={onClick}
    {...props}
  >
    {children || (
      <>
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </>
    )}
  </button>
);

export {
  Dialog,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

export default Dialog;