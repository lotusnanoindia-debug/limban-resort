"use client";

import * as React from "react";
import { format, isSameDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  className?: string;
  onUpdate?: (values: { range: DateRange; nights?: number }) => void;
}

export function RoomsDateRangePicker({
  className,
  onUpdate,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [nights, setNights] = React.useState<number | null>(null);

  const calculateNights = (from: Date, to: Date): number => {
    // Mirror the logic from ReservationForm.astro
    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    // Prevent same-day selection (0 nights)
    if (range?.from && range?.to && isSameDay(range.from, range.to)) {
      // If same day selected, only keep the from date (partial selection)
      const partialRange = { from: range.from, to: undefined };
      setDate(partialRange);
      setNights(null);
      if (onUpdate) {
        onUpdate({ range: partialRange });
      }
      return;
    }

    setDate(range);

    // Calculate nights when both dates are selected
    let nightsCount: number | null = null;
    if (range?.from && range?.to && !isSameDay(range.from, range.to)) {
      try {
        nightsCount = calculateNights(range.from, range.to);
        setNights(nightsCount);
      } catch (error) {
        console.error("Error calculating nights:", error);
        setNights(null);
      }
    } else {
      setNights(null);
    }

    if (onUpdate && range) {
      onUpdate({ range, nights: nightsCount ?? undefined });
    }

    // Only trigger nights calculation when BOTH dates are selected AND different days
    if (range?.from && range?.to && !isSameDay(range.from, range.to)) {
      setTimeout(() => {
        const event = new CustomEvent("dateRangeUpdated", {
          detail: { nights: nightsCount },
        });
        window.dispatchEvent(event);

        // Simply clear/hide any error message
        const nightsMessage = document.getElementById("nights-message");
        if (nightsMessage) {
          nightsMessage.className =
            "bg-gray-950 p-2 rounded-sm text-center mt-2 text-sm transition-opacity duration-500 ease-in-out opacity-0";
          nightsMessage.textContent = "";
        }
      }, 100);
    } else {
      // Clear the message if range is incomplete or same day
      setTimeout(() => {
        const event = new Event("dateRangeCleared");
        window.dispatchEvent(event);

        // Clear/hide nights message
        const nightsMessage = document.getElementById("nights-message");
        if (nightsMessage) {
          nightsMessage.className =
            "bg-gray-950 p-2 rounded-sm text-center mt-2 text-sm transition-opacity duration-500 ease-in-out opacity-0";
          nightsMessage.textContent = "";
        }
      }, 100);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal rounded-md bg-gray-800 border text-base border-gray-700 text-white hover:bg-gray-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors py-3 px-4 h-auto",
              !date && "text-gray-400"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  <span className="rounded-md px-2 bg-green-900 text-white">
                    {format(date.from, "LLL dd")}
                  </span>{" "}
                  to{" "}
                  <span className="rounded-md px-2 bg-green-900 text-white">
                    {format(date.to, "LLL dd")}
                  </span>
                  {nights && (
                    <span className="ml-2 text-sm text-green-400">
                      ({nights} Night{nights !== 1 ? "s" : ""})
                    </span>
                  )}
                </>
              ) : (
                <span className="rounded-md px-2 bg-amber-900 text-white">
                  {format(date.from, "LLL dd")} ... to ... ?
                </span>
              )
            ) : (
              <span>Click to select your dates</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            showOutsideDays={false}
            fixedWeeks={true}
            disabled={(calendarDate) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

              // Disable past dates and dates beyond 1 year
              if (calendarDate < today || calendarDate > maxDate) return true;

              return false;
            }}
          />
        </PopoverContent>
      </Popover>

      {/* Hidden inputs for form submission - database-friendly format */}
      <input
        type="hidden"
        name="checkin"
        value={date?.from ? format(date.from, "yyyy-MM-dd") : ""}
      />
      <input
        type="hidden"
        name="checkout"
        value={date?.to ? format(date.to, "yyyy-MM-dd") : ""}
      />
      <input type="hidden" name="nights" value={nights ? String(nights) : ""} />
    </div>
  );
}
