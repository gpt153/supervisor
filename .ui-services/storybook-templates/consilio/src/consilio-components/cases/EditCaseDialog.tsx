import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUpdateCase } from '@/hooks/useCases';
import { SocialWorkersSection } from './SocialWorkersSection';
import type { CaseDetail, UpdateCaseInput } from '@/types/case.types';

/**
 * Type definition for backend validation error response
 */
interface ValidationErrorField {
  path: string[];
  message: string;
  code: string;
}

interface ValidationErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  validation?: ValidationErrorField[];
}

const updateCaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().optional(),
  type: z
    .enum([
      'CHILD_PROTECTION',
      'ELDERLY_CARE',
      'DISABILITY_SUPPORT',
      'SUBSTANCE_ABUSE',
      'FAMILY_SUPPORT',
      'OTHER',
    ])
    .optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'CLOSED', 'ARCHIVED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  due_date: z.string().optional(),
  tags: z.string().optional(), // Comma-separated
  // Client information - empty strings allowed in form, converted to null on submit
  client_name: z.string().optional(),
  client_email: z.union([z.string().email('Invalid email format'), z.literal('')]).optional(),
  client_phone: z.string().optional(),
  client_personal_number: z.string().optional(),
  client_address: z.string().optional(),
  client_notes: z.string().optional(),
  // Foster family
  foster_family_name: z.string().optional(),
  foster_family_notes: z.string().optional(),
  // Social workers
  social_workers: z
    .array(
      z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email format'),
        phone: z.string().optional(),
        role: z.string().optional(),
        organization: z.string().optional(),
        responsibility: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

type UpdateCaseFormData = z.infer<typeof updateCaseSchema>;

interface EditCaseDialogProps {
  caseDetail: CaseDetail;
}

/**
 * Extract and format validation errors from backend response
 * Converts Zod validation error format into human-readable messages
 */
function formatValidationErrors(validationErrors?: ValidationErrorField[]): string {
  if (!validationErrors || validationErrors.length === 0) {
    return 'Validation failed. Please check your input.';
  }

  // Group errors by field for better readability
  const errorsByField = validationErrors.reduce(
    (acc, error) => {
      const fieldPath = error.path.join('.');
      if (!acc[fieldPath]) {
        acc[fieldPath] = [];
      }
      acc[fieldPath].push(error.message);
      return acc;
    },
    {} as Record<string, string[]>
  );

  // Format into readable error message
  const formattedErrors = Object.entries(errorsByField)
    .map(([field, messages]) => {
      const uniqueMessages = [...new Set(messages)];
      return `${field}: ${uniqueMessages.join(', ')}`;
    })
    .join(' | ');

  return formattedErrors;
}

export function EditCaseDialog({ caseDetail }: EditCaseDialogProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const updateCaseMutation = useUpdateCase(caseDetail.id);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<UpdateCaseFormData>({
    resolver: zodResolver(updateCaseSchema),
  });

  // Populate form with existing data when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        title: caseDetail.title,
        description: caseDetail.description || '',
        type: caseDetail.type,
        status: caseDetail.status,
        priority: caseDetail.priority,
        due_date: caseDetail.due_date
          ? new Date(caseDetail.due_date).toISOString().split('T')[0]
          : '',
        tags: caseDetail.tags?.join(', ') || '',
        // Pre-populate client fields
        client_name: caseDetail.client_name || '',
        client_email: caseDetail.client_email || '',
        client_phone: caseDetail.client_phone || '',
        client_personal_number: caseDetail.client_personal_number || '',
        client_address: caseDetail.client_address || '',
        client_notes: caseDetail.client_notes || '',
        // Foster family
        foster_family_name: caseDetail.foster_family_name || '',
        foster_family_notes: caseDetail.foster_family_notes || '',
        // Social workers
        social_workers: caseDetail.social_workers || [],
      });
      setValidationError(null);
    }
  }, [open, caseDetail, reset]);

  const onSubmit = (data: UpdateCaseFormData): void => {
    const input: UpdateCaseInput = {
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status,
      priority: data.priority,
      due_date: data.due_date ? new Date(`${data.due_date}T00:00:00.000Z`).toISOString() : undefined,
      tags: data.tags ? data.tags.split(',').map((tag) => tag.trim()) : undefined,
      // Client information - convert empty strings to null for backend compatibility
      client_name: data.client_name?.trim() || null,
      client_email: data.client_email?.trim() || null,
      client_phone: data.client_phone?.trim() || null,
      client_personal_number: data.client_personal_number?.trim() || null,
      client_address: data.client_address?.trim() || null,
      client_notes: data.client_notes?.trim() || null,
      // Foster family - convert empty strings to null for backend compatibility
      foster_family_name: data.foster_family_name?.trim() || null,
      foster_family_notes: data.foster_family_notes?.trim() || null,
      // Social workers
      social_workers: data.social_workers && data.social_workers.length > 0 ? data.social_workers : undefined,
    };

    // Clear any previous validation errors
    setValidationError(null);

    updateCaseMutation.mutate(input, {
      onSuccess: async () => {
        // Force immediate refetch (not just invalidation) before closing
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ['cases'] }),
          queryClient.refetchQueries({ queryKey: ['case', caseDetail.id] }),
          queryClient.refetchQueries({ queryKey: ['case-timeline', caseDetail.id] }),
        ]);
        setOpen(false);  // Close dialog AFTER refetch completes
      },
      onError: (error) => {
        // Extract validation errors from backend response
        const errorData = error as unknown as ValidationErrorResponse;

        if (errorData.statusCode === 400 && errorData.validation) {
          // Format and display specific validation errors
          const formattedError = formatValidationErrors(errorData.validation);
          setValidationError(formattedError);
        } else if (errorData.message) {
          // Use backend error message if available
          setValidationError(errorData.message);
        } else {
          // Fallback error message
          setValidationError('Failed to update case. Please check your input and try again.');
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit case</DialogTitle>
          <DialogDescription>Update case details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {(updateCaseMutation.error || validationError) && (
            <Alert variant="destructive">
              <AlertDescription>
                {validationError ||
                  updateCaseMutation.error?.message ||
                  'Failed to update case. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter case title"
              {...register('title')}
              disabled={updateCaseMutation.isPending}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Enter case description"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('description')}
              disabled={updateCaseMutation.isPending}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                onValueChange={(value) => setValue('type', value as UpdateCaseFormData['type'])}
                defaultValue={caseDetail.type}
                disabled={updateCaseMutation.isPending}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHILD_PROTECTION">Child Protection</SelectItem>
                  <SelectItem value="ELDERLY_CARE">Elderly Care</SelectItem>
                  <SelectItem value="DISABILITY_SUPPORT">Disability Support</SelectItem>
                  <SelectItem value="SUBSTANCE_ABUSE">Substance Abuse</SelectItem>
                  <SelectItem value="FAMILY_SUPPORT">Family Support</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value) => setValue('status', value as UpdateCaseFormData['status'])}
                defaultValue={caseDetail.status}
                disabled={updateCaseMutation.isPending}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                onValueChange={(value) =>
                  setValue('priority', value as UpdateCaseFormData['priority'])
                }
                defaultValue={caseDetail.priority}
                disabled={updateCaseMutation.isPending}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-destructive">{errors.priority.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                {...register('due_date')}
                disabled={updateCaseMutation.isPending}
              />
              {errors.due_date && (
                <p className="text-sm text-destructive">{errors.due_date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="urgent, high-priority, follow-up"
              {...register('tags')}
              disabled={updateCaseMutation.isPending}
            />
            {errors.tags && <p className="text-sm text-destructive">{errors.tags.message}</p>}
          </div>

          {/* Client Information Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Client Information</h3>
            <p className="text-sm text-muted-foreground">
              Information about the person this case concerns
            </p>

            <div className="space-y-2">
              <Label htmlFor="client_name">Name</Label>
              <Input
                id="client_name"
                placeholder="Client's full name"
                {...register('client_name')}
                disabled={updateCaseMutation.isPending}
              />
              {errors.client_name && (
                <p className="text-sm text-destructive">{errors.client_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_email">Email</Label>
                <Input
                  id="client_email"
                  type="email"
                  placeholder="client@example.com"
                  {...register('client_email')}
                  disabled={updateCaseMutation.isPending}
                />
                {errors.client_email && (
                  <p className="text-sm text-destructive">{errors.client_email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_phone">Phone</Label>
                <Input
                  id="client_phone"
                  placeholder="+46 70 123 45 67"
                  {...register('client_phone')}
                  disabled={updateCaseMutation.isPending}
                />
                {errors.client_phone && (
                  <p className="text-sm text-destructive">{errors.client_phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_personal_number">Personal Number (Personnummer)</Label>
              <Input
                id="client_personal_number"
                placeholder="YYYYMMDD-XXXX"
                {...register('client_personal_number')}
                disabled={updateCaseMutation.isPending}
              />
              {errors.client_personal_number && (
                <p className="text-sm text-destructive">{errors.client_personal_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_address">Address</Label>
              <Input
                id="client_address"
                placeholder="Street address, city, postal code"
                {...register('client_address')}
                disabled={updateCaseMutation.isPending}
              />
              {errors.client_address && (
                <p className="text-sm text-destructive">{errors.client_address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_notes">Notes</Label>
              <Textarea
                id="client_notes"
                placeholder="Additional information about the client"
                rows={3}
                {...register('client_notes')}
                disabled={updateCaseMutation.isPending}
              />
              {errors.client_notes && (
                <p className="text-sm text-destructive">{errors.client_notes.message}</p>
              )}
            </div>
          </div>

          {/* Foster Family Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Familjehem</h3>
            <p className="text-sm text-muted-foreground">
              Information om tilldelat familjehem
            </p>

            <div className="space-y-2">
              <Label htmlFor="foster_family_name">Familjehemmets namn</Label>
              <Input
                id="foster_family_name"
                placeholder="T.ex. Familjen Andersson"
                {...register('foster_family_name')}
                disabled={updateCaseMutation.isPending}
              />
              {errors.foster_family_name && (
                <p className="text-sm text-destructive">{errors.foster_family_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="foster_family_notes">Anteckningar</Label>
              <Textarea
                id="foster_family_notes"
                placeholder="Ytterligare information om familjehemmet"
                rows={3}
                {...register('foster_family_notes')}
                disabled={updateCaseMutation.isPending}
              />
              {errors.foster_family_notes && (
                <p className="text-sm text-destructive">{errors.foster_family_notes.message}</p>
              )}
            </div>
          </div>

          {/* Social Workers Section */}
          <div className="space-y-4 pt-4 border-t">
            <SocialWorkersSection control={control} register={register} errors={errors} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateCaseMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateCaseMutation.isPending}>
              {updateCaseMutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
