import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
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
import { useCreateCase } from '@/hooks/useCases';
import { SocialWorkersSection } from './SocialWorkersSection';
import type { CreateCaseInput } from '@/types/case.types';

const createCaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum([
    'CHILD_PROTECTION',
    'ELDERLY_CARE',
    'DISABILITY_SUPPORT',
    'SUBSTANCE_ABUSE',
    'FAMILY_SUPPORT',
    'OTHER',
  ]).default('OTHER'), // Hidden field, always set to OTHER
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  due_date: z.string().optional(),
  tags: z.string().optional(), // Comma-separated
  // Client information
  client_name: z.string().optional(),
  client_email: z.string().email('Invalid email format').optional().or(z.literal('')),
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

type CreateCaseFormData = z.infer<typeof createCaseSchema>;

export function CreateCaseDialog(): JSX.Element {
  const [open, setOpen] = useState(false);
  const createCaseMutation = useCreateCase();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateCaseFormData>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: {
      type: 'OTHER',
      priority: 'MEDIUM',
      social_workers: [],
    },
  });

  const onSubmit = (data: CreateCaseFormData): void => {
    // Convert date to ISO datetime if provided
    let dueDate = data.due_date;
    if (dueDate && /^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      // Convert YYYY-MM-DD to ISO datetime (end of day in local timezone)
      dueDate = `${dueDate}T23:59:59.000Z`;
    }

    const input: CreateCaseInput = {
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      due_date: dueDate,
      tags: data.tags ? data.tags.split(',').map((tag) => tag.trim()) : undefined,
      // Client information
      client_name: data.client_name || undefined,
      client_email: data.client_email || undefined,
      client_phone: data.client_phone || undefined,
      client_personal_number: data.client_personal_number || undefined,
      client_address: data.client_address || undefined,
      client_notes: data.client_notes || undefined,
      // Foster family
      foster_family_name: data.foster_family_name || undefined,
      foster_family_notes: data.foster_family_notes || undefined,
      // Social workers
      social_workers: data.social_workers && data.social_workers.length > 0 ? data.social_workers : undefined,
    };

    createCaseMutation.mutate(input, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New case
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create new case</DialogTitle>
          <DialogDescription>Fill in the details to create a new case</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {createCaseMutation.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {createCaseMutation.error.message || 'Failed to create case. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter case title"
              {...register('title')}
              disabled={createCaseMutation.isPending}
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
              disabled={createCaseMutation.isPending}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                onValueChange={(value) =>
                  setValue('priority', value as CreateCaseFormData['priority'])
                }
                defaultValue="MEDIUM"
                disabled={createCaseMutation.isPending}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              {...register('due_date')}
              disabled={createCaseMutation.isPending}
            />
            {errors.due_date && (
              <p className="text-sm text-destructive">{errors.due_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="urgent, high-priority, follow-up"
              {...register('tags')}
              disabled={createCaseMutation.isPending}
            />
            {errors.tags && <p className="text-sm text-destructive">{errors.tags.message}</p>}
          </div>

          {/* Client Information Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Client Information</h3>
            <p className="text-sm text-muted-foreground">
              Optional information about the person this case concerns
            </p>

            <div className="space-y-2">
              <Label htmlFor="client_name">Name</Label>
              <Input
                id="client_name"
                placeholder="Client's full name"
                {...register('client_name')}
                disabled={createCaseMutation.isPending}
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
                  disabled={createCaseMutation.isPending}
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
                  disabled={createCaseMutation.isPending}
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
                disabled={createCaseMutation.isPending}
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
                disabled={createCaseMutation.isPending}
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
                disabled={createCaseMutation.isPending}
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
                disabled={createCaseMutation.isPending}
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
                disabled={createCaseMutation.isPending}
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
              disabled={createCaseMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createCaseMutation.isPending}>
              {createCaseMutation.isPending ? 'Creating...' : 'Create case'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
