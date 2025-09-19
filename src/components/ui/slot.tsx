import * as React from "react"
import * as SlotPrimitive from "@radix-ui/react-slot"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const Slot = React.forwardRef<
  React.ElementRef<typeof SlotPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SlotPrimitive.Root> &
    VariantProps<typeof SlotPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <SlotPrimitive.Root
      ref={ref}
      className={cn(className)}
      {...props}
    />
  )
})
Slot.displayName = SlotPrimitive.Root.displayName

export { Slot }
