import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
}

export const DateRangePicker = ({ dateRange, onDateRangeChange, className }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const presetRanges = {
    today: {
      label: "Hoje",
      range: {
        from: new Date(),
        to: new Date(),
      },
    },
    yesterday: {
      label: "Ontem",
      range: {
        from: new Date(Date.now() - 24 * 60 * 60 * 1000),
        to: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
    last7days: {
      label: "Últimos 7 dias",
      range: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    },
    last30days: {
      label: "Últimos 30 dias",
      range: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    },
    thisMonth: {
      label: "Este mês",
      range: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
      },
    },
    lastMonth: {
      label: "Mês passado",
      range: {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      },
    },
  };

  const handlePresetSelect = (preset: keyof typeof presetRanges) => {
    onDateRangeChange(presetRanges[preset].range);
    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                  {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecionar período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="border-r border-border p-3">
              <div className="space-y-1">
                <div className="text-sm font-medium text-foreground mb-2">Períodos</div>
                {Object.entries(presetRanges).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => handlePresetSelect(key as keyof typeof presetRanges)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={{ from: dateRange?.from, to: dateRange?.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    onDateRangeChange({ from: range.from, to: range.to });
                    setIsOpen(false);
                  }
                }}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};