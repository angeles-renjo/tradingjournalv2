// components/trade-form/fields/price-fields.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  TradeFormState,
  TradeFormHandlers,
} from "@/types/trade-form-type";

interface PriceFieldsProps {
  formData: TradeFormState;
  handlers: Pick<TradeFormHandlers, "handleChange">;
}

export function PriceFields({ formData, handlers }: PriceFieldsProps) {
  const { handleChange } = handlers;

  return (
    <>
      {/* Entry/Exit Prices */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="entryPrice" className="text-right">
            Entry *
          </Label>
          <Input
            id="entryPrice"
            name="entryPrice"
            type="number"
            step="any"
            placeholder="0.00"
            className="col-span-3"
            value={formData.entryPrice}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="exitPrice" className="text-right">
            Exit *
          </Label>
          <Input
            id="exitPrice"
            name="exitPrice"
            type="number"
            step="any"
            placeholder="0.00"
            className="col-span-3"
            value={formData.exitPrice}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Position Size */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="positionSize" className="text-right">
          Size *
        </Label>
        <Input
          id="positionSize"
          name="positionSize"
          type="number"
          step="any"
          placeholder="Position size"
          className="col-span-3"
          value={formData.positionSize}
          onChange={handleChange}
          required
        />
      </div>

      {/* Stop Loss/Take Profit */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="stopLoss" className="text-right">
            Stop
          </Label>
          <Input
            id="stopLoss"
            name="stopLoss"
            type="number"
            step="any"
            placeholder="0.00"
            className="col-span-3"
            value={formData.stopLoss}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="takeProfit" className="text-right">
            Target
          </Label>
          <Input
            id="takeProfit"
            name="takeProfit"
            type="number"
            step="any"
            placeholder="0.00"
            className="col-span-3"
            value={formData.takeProfit}
            onChange={handleChange}
          />
        </div>
      </div>
    </>
  );
}
