// components/trade-form/fields/setup-fields.tsx
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  TradeFormState,
  TradeFormHandlers,
} from "@/types/trade-form-type";
import { SETUP_TYPES } from "@/types/trade-form";
import { calculateRiskReward } from "@/lib/utils/trade-form";

interface SetupFieldsProps {
  formData: TradeFormState;
  handlers: Pick<TradeFormHandlers, "handleChange">;
}

export function SetupFields({ formData, handlers }: SetupFieldsProps) {
  const { handleChange } = handlers;

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="setupType" className="text-right">
          Setup *
        </Label>
        <Select
          name="setupType"
          value={formData.setupType || ""}
          onValueChange={(value) =>
            handleChange({ target: { name: "setupType", value } } as any)
          }
          required
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select setup type" />
          </SelectTrigger>
          <SelectContent>
            {SETUP_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Risk:Reward Display */}
      {formData.stopLoss && formData.takeProfit && (
        <div className="grid grid-cols-4 items-center gap-4">
          <div className="col-start-2 col-span-3">
            <span className="text-sm text-muted-foreground">
              Risk:Reward Ratio: {calculateRiskReward(formData)}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
