// components/trade-form/fields/date-fields.tsx
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type {
  TradeFormState,
  TradeFormHandlers,
} from "@/types/trade-form-type";

interface DateFieldsProps {
  formData: TradeFormState;
  handlers: Pick<TradeFormHandlers, "handleDateSelect" | "handleChange">;
}

export function DateFields({ formData, handlers }: DateFieldsProps) {
  const { handleDateSelect } = handlers;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Entry Date/Time */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="entryDateTime" className="text-right">
          Entry Date *
        </Label>
        <div className="col-span-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.entryDateTime && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.entryDateTime ? (
                  format(new Date(formData.entryDateTime), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={new Date(formData.entryDateTime)}
                onSelect={(date) => handleDateSelect("entry", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Input
            type="time"
            className="mt-2"
            value={format(new Date(formData.entryDateTime), "HH:mm")}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(":").map(Number);
              const date = new Date(formData.entryDateTime);
              date.setHours(hours, minutes);
              handlers.handleChange({
                target: {
                  name: "entryDateTime",
                  value: date.toISOString(),
                },
              } as any);
            }}
            required
          />
        </div>
      </div>

      {/* Exit Date/Time */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="exitDateTime" className="text-right">
          Exit Date *
        </Label>
        <div className="col-span-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.exitDateTime && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.exitDateTime ? (
                  format(new Date(formData.exitDateTime), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={new Date(formData.exitDateTime)}
                onSelect={(date) => handleDateSelect("exit", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Input
            type="time"
            className="mt-2"
            value={format(new Date(formData.exitDateTime), "HH:mm")}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(":").map(Number);
              const date = new Date(formData.exitDateTime);
              date.setHours(hours, minutes);
              handlers.handleChange({
                target: {
                  name: "exitDateTime",
                  value: date.toISOString(),
                },
              } as any);
            }}
            required
          />
        </div>
      </div>
    </div>
  );
}
