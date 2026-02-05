import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/date';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import type { Case, CaseStatus, CasePriority } from '@/types/case.types';

interface CasesTableProps {
  cases: Case[];
}

const statusVariant: Record<CaseStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  OPEN: 'default',
  IN_PROGRESS: 'secondary',
  ON_HOLD: 'outline',
  CLOSED: 'outline',
  ARCHIVED: 'outline',
};

const priorityVariant: Record<CasePriority, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  LOW: 'outline',
  MEDIUM: 'secondary',
  HIGH: 'default',
  URGENT: 'destructive',
};

const statusLabels: Record<CaseStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
};

const priorityLabels: Record<CasePriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export function CasesTable({ cases }: CasesTableProps): JSX.Element {
  return (
    <>
      {/* Desktop: Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((caseItem) => (
              <TableRow key={caseItem.id} className="cursor-pointer">
                <TableCell>
                  <Link
                    to={`/cases/${caseItem.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {caseItem.case_number}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/cases/${caseItem.id}`} className="hover:underline">
                    {caseItem.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[caseItem.status]}>
                    {statusLabels[caseItem.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityVariant[caseItem.priority]}>
                    {priorityLabels[caseItem.priority]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(caseItem.opened_at, 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {caseItem.due_date ? formatDate(caseItem.due_date, 'MMM d, yyyy') : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: Card View */}
      <div className="md:hidden space-y-4">
        {cases.map((caseItem) => (
          <Link key={caseItem.id} to={`/cases/${caseItem.id}`}>
            <Card className="hover:bg-accent/50 transition-colors min-h-[44px]">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-primary">{caseItem.case_number}</p>
                    <p className="text-sm">{caseItem.title}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant={statusVariant[caseItem.status]}>
                    {statusLabels[caseItem.status]}
                  </Badge>
                  <Badge variant={priorityVariant[caseItem.priority]}>
                    {priorityLabels[caseItem.priority]}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(caseItem.opened_at, 'MMM d, yyyy')}</span>
                  </div>
                  {caseItem.due_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(caseItem.due_date, 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
