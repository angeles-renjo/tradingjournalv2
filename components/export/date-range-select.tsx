// components/export/date-range-select.tsx
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { exportData } from '@/lib/actions/export';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangeSelectProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateRangeSelect: React.FC<DateRangeSelectProps> = ({
  onChange,
  value,
}) => {
  return (
    <Card>
      <CardContent className='pt-4'>
        <div className='flex flex-col space-y-4'>
          <div className='flex items-center space-x-2'>
            <Calendar className='h-4 w-4' />
            <Label>Date Range</Label>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col space-y-2'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'justify-start text-left font-normal',
                      !value.startDate && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className='mr-2 h-4 w-4' />
                    {value.startDate ? (
                      format(value.startDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <CalendarComponent
                    mode='single'
                    selected={value.startDate}
                    onSelect={(date) =>
                      onChange({ ...value, startDate: date || new Date() })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className='flex flex-col space-y-2'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'justify-start text-left font-normal',
                      !value.endDate && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className='mr-2 h-4 w-4' />
                    {value.endDate ? (
                      format(value.endDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <CalendarComponent
                    mode='single'
                    selected={value.endDate}
                    onSelect={(date) =>
                      onChange({ ...value, endDate: date || new Date() })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
