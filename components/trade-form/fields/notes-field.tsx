// components/trade-form/fields/notes-field.tsx
import { Label } from '@/components/ui/label';
import type {
  TradeFormState,
  TradeFormHandlers,
} from '@/types/trade-form-type';

interface NotesFieldProps {
  formData: TradeFormState;
  handlers: Pick<TradeFormHandlers, 'handleChange'>;
}

export function NotesField({ formData, handlers }: NotesFieldProps) {
  const { handleChange } = handlers;

  return (
    <div className='grid grid-cols-4 gap-4'>
      <Label htmlFor='notes' className='text-right pt-2'>
        Notes
      </Label>
      <textarea
        id='notes'
        name='notes'
        className='col-span-3 min-h-[120px] w-full p-3 rounded-md border bg-background text-sm resize-y'
        value={formData.notes}
        onChange={handleChange}
        placeholder='Trade Analysis & Learnings:
- What was your trading plan?
- What went well in this trade?
- What could be improved?
- Key lessons learned for future trades...'
      />
    </div>
  );
}
