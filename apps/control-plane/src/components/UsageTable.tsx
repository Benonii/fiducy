import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import { formatDay, formatNumber } from './format';

import type { UsageTableProps } from './types';

export function UsageTable({ days }: UsageTableProps) {
  return (
    <div className="max-h-64 overflow-y-auto border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            <TableHead className="text-right">Requests</TableHead>
            <TableHead className="text-right">Input tokens</TableHead>
            <TableHead className="text-right">Output tokens</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...days].reverse().map((day) => (
            <TableRow key={day.date}>
              <TableCell>{formatDay(day.date)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(day.requestCount)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(day.inputTokens)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(day.outputTokens)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
