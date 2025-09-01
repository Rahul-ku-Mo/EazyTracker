
import { ReactNode, useState} from "react"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,

  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export const DueDateDropdown = ({ children }: { children : ReactNode}) => {
  const [open, setOpen] = useState(false)

  return (
    <>
     <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-fit h-fit p-1.5">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Set due date...</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>Tomorrow</DropdownMenuItem>
            <DropdownMenuItem>End of this week</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Custom due date</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="mx-2 p-0">
                {children}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
