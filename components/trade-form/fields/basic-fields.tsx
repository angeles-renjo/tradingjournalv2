// components/trade-form/fields/basic-fields.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type TradeFormState,
  type TradeFormHandlers,
} from "@/types/trade-form-type";

interface BasicFieldsProps {
  formData: TradeFormState;
  handlers: Pick<TradeFormHandlers, "handleChange">;
}

export function BasicFields({ formData, handlers }: BasicFieldsProps) {
  const { handleChange } = handlers;

  return (
    <>
      {/* Instrument */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="instrument" className="text-right">
          Instrument *
        </Label>
        <Input
          id="instrument"
          name="instrument"
          placeholder="e.g., EURUSD, AAPL, BTC/USD"
          className="col-span-3"
          value={formData.instrument}
          onChange={handleChange}
          required
        />
      </div>

      {/* Direction */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="direction" className="text-right">
          Direction *
        </Label>
        <Select
          name="direction"
          value={formData.direction}
          onValueChange={(value) =>
            handleChange({ target: { name: "direction", value } } as any)
          }
          required
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="long">Long</SelectItem>
            <SelectItem value="short">Short</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
