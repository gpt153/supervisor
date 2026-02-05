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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateCase } from '@/hooks/useCases';
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
  ]),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

type CreateCaseFormData = z.infer<typeof createCaseSchema>;

export function CreateCaseDialogSimple(): JSX.Element {
  const [open, setOpen] = useState(false);
  const createCaseMutation = useCreateCase();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateCaseFormData>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: {
      type: 'OTHER',
      priority: 'MEDIUM',
    },
  });

  const onSubmit = (data: CreateCaseFormData): void => {
    const input: CreateCaseInput = {
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
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
          New case (Simple)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create new case</DialogTitle>
          <DialogDescription>Fill in the basic details</DialogDescription>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              onValueChange={(value) => setValue('type', value as CreateCaseFormData['type'])}
              defaultValue="OTHER"
              disabled={createCaseMutation.isPending}
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
