'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Trade } from '@/types';

export function renderCell(
  column: keyof Trade,
  value: Trade[keyof Trade],
  trade: Trade
): React.ReactNode {
  switch (column) {
    case 'entry_date':
      return format(new Date(value as string), 'MMM dd, yyyy');

    case 'direction':
      return (
        <Badge variant={value === 'long' ? 'default' : 'secondary'}>
          {(value as string).charAt(0).toUpperCase() +
            (value as string).slice(1)}
        </Badge>
      );

    case 'entry_price':
    case 'exit_price':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value as number);

    case 'profit_loss':
      return (
        <span
          className={`${(value as number) > 0 ? 'text-green-500' : 'text-red-500'}`}
        >
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            signDisplay: 'always',
          }).format(value as number)}
        </span>
      );

    case 'setup_type':
      return (
        <Badge variant='outline'>
          {(value as string)
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
        </Badge>
      );

    case 'notes':
      if (!value) return <div className='min-h-10 w-64'>-</div>;

      return (
        <Dialog>
          <DialogTrigger asChild>
            <div className='min-h-10 w-64 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md p-2'>
              <p className='line-clamp-2 text-sm'>{value as string}</p>
            </div>
          </DialogTrigger>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Trade Notes</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <p className='text-sm whitespace-pre-wrap'>{value as string}</p>
            </div>
          </DialogContent>
        </Dialog>
      );

    default:
      return value?.toString();
  }
}
