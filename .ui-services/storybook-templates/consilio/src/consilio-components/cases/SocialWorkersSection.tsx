import React from 'react';
import { useFieldArray } from 'react-hook-form';
import type { Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SocialWorkersSectionProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

export function SocialWorkersSection({
  control,
  register,
  errors,
}: SocialWorkersSectionProps): React.ReactElement {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'social_workers',
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-sm text-gray-900">Socialsekreterare</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              name: '',
              email: '',
              phone: '',
              role: '',
              organization: '',
              responsibility: '',
            })
          }
        >
          <Plus className="h-4 w-4 mr-1" />
          Lägg till socialsekreterare
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          Inga socialsekreterare tillagda. Klicka på knappen ovan för att lägga till.
        </p>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-medium text-gray-700">
              Socialsekreterare {index + 1}
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`social_workers.${index}.name`}>
                Namn <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`social_workers.${index}.name`}
                {...register(`social_workers.${index}.name` as const)}
                placeholder="Förnamn Efternamn"
              />
              {errors.social_workers && Array.isArray(errors.social_workers) && errors.social_workers[index]?.name && (
                <span className="text-sm text-red-500">
                  {String((errors.social_workers[index] as any)?.name?.message || 'Name is required')}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor={`social_workers.${index}.email`}>
                E-post <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`social_workers.${index}.email`}
                type="email"
                {...register(`social_workers.${index}.email` as const)}
                placeholder="exempel@kommun.se"
              />
              {errors.social_workers && Array.isArray(errors.social_workers) && errors.social_workers[index]?.email && (
                <span className="text-sm text-red-500">
                  {String((errors.social_workers[index] as any)?.email?.message || 'Email is required')}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor={`social_workers.${index}.phone`}>Telefon</Label>
              <Input
                id={`social_workers.${index}.phone`}
                type="tel"
                {...register(`social_workers.${index}.phone` as const)}
                placeholder="070-123 45 67"
              />
            </div>

            <div>
              <Label htmlFor={`social_workers.${index}.role`}>Roll</Label>
              <Input
                id={`social_workers.${index}.role`}
                {...register(`social_workers.${index}.role` as const)}
                placeholder="T.ex. Handläggare, Biträdande"
              />
            </div>

            <div>
              <Label htmlFor={`social_workers.${index}.organization`}>
                Organisation
              </Label>
              <Input
                id={`social_workers.${index}.organization`}
                {...register(`social_workers.${index}.organization` as const)}
                placeholder="T.ex. Stockholms kommun"
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`social_workers.${index}.responsibility`}>
              Ansvarsområde
            </Label>
            <Textarea
              id={`social_workers.${index}.responsibility`}
              {...register(`social_workers.${index}.responsibility` as const)}
              placeholder="Beskriv ansvarsområden och arbetsuppgifter..."
              rows={2}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
