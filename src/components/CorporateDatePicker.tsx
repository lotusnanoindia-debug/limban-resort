"use client"
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function CorporateDatePicker({
  name,
  required = false,
  placeholder = "Pick a date",
}: { name: string; required?: boolean; placeholder?: string }) {
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="w-full rounded-2xl bg-gray-800/50 border border-gray-600 pl-14 pr-6 py-4 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 cursor-pointer relative">
            <CalendarIcon className="absolute left-6 h-5 w-5 text-gray-400" />
            <span className={cn("block", !date && "text-gray-400")}>
              {date ? format(date, "PPP") : placeholder}
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (!d) return
              setDate(d)
              setOpen(false)
            }}
            disabled={(date) => {
              const today = new Date()
              const minDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
              const maxDate = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000)
              return date < minDate || date > maxDate
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      <input
        type="hidden"
        name={name}
        value={date ? format(date, "yyyy-MM-dd") : ""}
        required={required}
      />
    </>
  )
}
