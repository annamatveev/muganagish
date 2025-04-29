
import * as React from "react"
import { cn } from "@/lib/utils"

const TooltipContext = React.createContext({
  open: false,
  setOpen: () => {},
  mouseOver: false,
  setMouseOver: () => {}
})

const TooltipProvider = ({ children }) => {
  return children;
};

const Tooltip = ({ children, delayDuration = 300, open: controlledOpen, onOpenChange }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [mouseOver, setMouseOver] = React.useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = controlledOpen !== undefined ? onOpenChange : setUncontrolledOpen;
  
  React.useEffect(() => {
    if (mouseOver) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, delayDuration);
      
      return () => clearTimeout(timer);
    } else {
      setOpen(false);
    }
  }, [mouseOver, delayDuration, setOpen]);
  
  return (
    <TooltipContext.Provider value={{ open, setOpen, mouseOver, setMouseOver }}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  );
};

const TooltipTrigger = React.forwardRef(({ className, asChild, children, ...props }, ref) => {
  const { setMouseOver } = React.useContext(TooltipContext);
  
  const handleMouseEnter = (e) => {
    setMouseOver(true);
    props.onMouseEnter?.(e);
  };
  
  const handleMouseLeave = (e) => {
    setMouseOver(false);
    props.onMouseLeave?.(e);
  };
  
  if (asChild) {
    return React.cloneElement(children, {
      ref,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      ...props
    });
  }
  
  return (
    <span
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("inline-block", className)}
      {...props}
    >
      {children}
    </span>
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef(({ className, sideOffset = 4, side = "top", align = "center", ...props }, ref) => {
  const { open } = React.useContext(TooltipContext);
  
  if (!open) return null;
  
  return (
    <div
      ref={ref}
      className={cn(
        "fixed z-[100] rounded-md border bg-white p-2 text-sm shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={{
        position: 'fixed',
        transform: 'translate(-50%, -100%)',
        marginTop: '-8px',
      }}
      {...props}
    />
  );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

export default {
  Provider: TooltipProvider,
  Root: Tooltip,
  Trigger: TooltipTrigger,
  Content: TooltipContent
};
