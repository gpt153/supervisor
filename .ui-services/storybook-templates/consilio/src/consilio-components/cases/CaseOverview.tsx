import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, User, Tag, AlertCircle, UserCircle, Home, Users } from 'lucide-react';
import { formatDate } from '@/lib/date';
import type { CaseDetail } from '@/types/case.types';

interface CaseOverviewProps {
  caseDetail: CaseDetail;
}

const statusLabels = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
} as const;

const priorityLabels = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
} as const;

const typeLabels = {
  CHILD_PROTECTION: 'Child Protection',
  ELDERLY_CARE: 'Elderly Care',
  DISABILITY_SUPPORT: 'Disability Support',
  SUBSTANCE_ABUSE: 'Substance Abuse',
  FAMILY_SUPPORT: 'Family Support',
  OTHER: 'Other',
} as const;

const statusVariant = {
  OPEN: 'default',
  IN_PROGRESS: 'secondary',
  ON_HOLD: 'outline',
  CLOSED: 'outline',
  ARCHIVED: 'outline',
} as const;

const priorityVariant = {
  LOW: 'outline',
  MEDIUM: 'secondary',
  HIGH: 'default',
  URGENT: 'destructive',
} as const;

/**
 * Overview tab component showing case summary and key information
 * Displays case status, priority, dates, and quick stats
 */
export function CaseOverview({ caseDetail }: CaseOverviewProps): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Status & Priority Card */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={statusVariant[caseDetail.status]} className="text-base px-4 py-2">
              {statusLabels[caseDetail.status]}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={priorityVariant[caseDetail.priority]} className="text-base px-4 py-2">
              <AlertCircle className="mr-2 h-4 w-4" />
              {priorityLabels[caseDetail.priority]}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Case Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Case Number</p>
              <p className="text-sm font-mono">{caseDetail.case_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Type</p>
              <p className="text-sm">{typeLabels[caseDetail.type]}</p>
            </div>
          </div>

          {caseDetail.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{caseDetail.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline & Dates Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Important Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Opened</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(caseDetail.opened_at, 'MMMM d, yyyy')}
                </p>
              </div>
            </div>

            {caseDetail.due_date && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Due Date</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(caseDetail.due_date, 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {caseDetail.closed_at && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Closed</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(caseDetail.closed_at, 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* People Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            People
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Created By</p>
              <p className="text-sm font-medium">{caseDetail.created_by.full_name}</p>
              <p className="text-xs text-muted-foreground">{caseDetail.created_by.email}</p>
            </div>

            {caseDetail.assigned_to && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Assigned To</p>
                <p className="text-sm font-medium">{caseDetail.assigned_to.full_name}</p>
                <p className="text-xs text-muted-foreground">{caseDetail.assigned_to.email}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCircle className="mr-2 h-5 w-5" />
            Client Information
          </CardTitle>
          <CardDescription>Information about the person this case concerns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="text-sm font-medium mt-1">
                {caseDetail.client_name || (
                  <span className="text-muted-foreground italic">Not provided</span>
                )}
              </p>
            </div>

            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-sm font-medium mt-1">
                {caseDetail.client_email ? (
                  <a
                    href={`mailto:${caseDetail.client_email}`}
                    className="text-primary hover:underline"
                  >
                    {caseDetail.client_email}
                  </a>
                ) : (
                  <span className="text-muted-foreground italic">Not provided</span>
                )}
              </p>
            </div>

            <div>
              <Label className="text-muted-foreground">Phone</Label>
              <p className="text-sm font-medium mt-1">
                {caseDetail.client_phone ? (
                  <a href={`tel:${caseDetail.client_phone}`} className="text-primary hover:underline">
                    {caseDetail.client_phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground italic">Not provided</span>
                )}
              </p>
            </div>

            <div>
              <Label className="text-muted-foreground">Personal Number</Label>
              <p className="text-sm font-medium mt-1">
                {caseDetail.client_personal_number || (
                  <span className="text-muted-foreground italic">Not provided</span>
                )}
              </p>
            </div>

            <div className="md:col-span-2">
              <Label className="text-muted-foreground">Address</Label>
              <p className="text-sm font-medium mt-1">
                {caseDetail.client_address || (
                  <span className="text-muted-foreground italic">Not provided</span>
                )}
              </p>
            </div>

            {caseDetail.client_notes && (
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">Notes</Label>
                <p className="text-sm font-medium mt-1 whitespace-pre-wrap">
                  {caseDetail.client_notes}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Foster Family Card */}
      {(caseDetail.foster_family_name || caseDetail.foster_family_notes) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="mr-2 h-5 w-5" />
              Familjehem
            </CardTitle>
            <CardDescription>Information om tilldelat familjehem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {caseDetail.foster_family_name && (
                <div>
                  <Label className="text-muted-foreground">Familjehemmets namn</Label>
                  <p className="text-sm font-medium mt-1">{caseDetail.foster_family_name}</p>
                </div>
              )}
              {caseDetail.foster_family_notes && (
                <div>
                  <Label className="text-muted-foreground">Anteckningar</Label>
                  <p className="text-sm font-medium mt-1 whitespace-pre-wrap">
                    {caseDetail.foster_family_notes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Workers Card */}
      {caseDetail.social_workers && caseDetail.social_workers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Socialsekreterare
            </CardTitle>
            <CardDescription>
              {caseDetail.social_workers.length} socialsekreterare tilldelade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {caseDetail.social_workers.map((worker, index) => (
                <div key={worker.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{worker.name}</p>
                      {worker.role && (
                        <p className="text-xs text-muted-foreground">{worker.role}</p>
                      )}
                    </div>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Primär
                      </Badge>
                    )}
                  </div>

                  <div className="grid gap-2 md:grid-cols-2 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">E-post</Label>
                      <a
                        href={`mailto:${worker.email}`}
                        className="text-primary hover:underline block"
                      >
                        {worker.email}
                      </a>
                    </div>

                    {worker.phone && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Telefon</Label>
                        <a
                          href={`tel:${worker.phone}`}
                          className="text-primary hover:underline block"
                        >
                          {worker.phone}
                        </a>
                      </div>
                    )}

                    {worker.organization && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Organisation</Label>
                        <p>{worker.organization}</p>
                      </div>
                    )}
                  </div>

                  {worker.responsibility && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Ansvarsområde</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{worker.responsibility}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags Card */}
      {caseDetail.tags && caseDetail.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="mr-2 h-5 w-5" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {caseDetail.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
