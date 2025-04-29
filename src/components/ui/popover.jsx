import * as React from "react"
import { cn } from "@/lib/utils"

const Popover = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  
  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      {children}
    </PopoverContext.Provider>
  )
}

const PopoverContext = React.createContext({ open: false, setOpen: () => {} })

const PopoverTrigger = React.forwardRef(({ className, children, asChild, ...props }, ref) => {
  const { setOpen } = React.useContext(PopoverContext)
  
  const handleClick = (e) => {
    setOpen(prev => !prev)
    props.onClick?.(e)
  }
  
  if (asChild) {
    return React.cloneElement(children, { 
      ref, 
      onClick: handleClick,
      ...props 
    })
  }
  
  return (
    <button 
      ref={ref} 
      onClick={handleClick}
      className={cn(className)} 
      {...props}
    >
      {children}
    </button>
  )
})
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef(({ className, children, align = "center", sideOffset = 4, ...props }, ref) => {
  const { open, setOpen } = React.useContext(PopoverContext)
  
  if (!open) return null
  
  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [ref, setOpen])

  return (
    <div
      ref={ref}
      className={cn(
        "z-50 w-72 rounded-md border bg-white p-4 shadow-md outline-none animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }

export default Popover;