
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { AnomalyType } from '@/types';

interface AnomalyFormProps {
  assignmentId: string;
  batchId: string;
  operatorId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  maxQuantity: number;
}

export default function AnomalyForm({
  assignmentId,
  batchId,
  operatorId,
  onSubmit,
  onCancel,
  maxQuantity
}: AnomalyFormProps) {
  const form = useForm({
    defaultValues: {
      type: 'damaged_box' as AnomalyType,
      quantity: 1,
      description: '',
      deviation_number: '',
    }
  });

  const anomalyTypes = [
    { value: 'damaged_box', label: 'Boîte abîmée' },
    { value: 'empty_case', label: 'Étuis vides' },
    { value: 'missing_from_original', label: 'Manque dans un colis d\'origine' },
    { value: 'other', label: 'Autre anomalie' }
  ];

  const handleSubmit = (data: any) => {
    if (data.quantity > maxQuantity) {
      toast({
        variant: "destructive",
        description: `La quantité ne peut pas dépasser ${maxQuantity} boîtes.`
      });
      return;
    }

    onSubmit({
      ...data,
      assignment_id: assignmentId,
      batch_id: batchId,
      operator_id: operatorId,
      detection_date: new Date().toISOString(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type d'anomalie</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                {anomalyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantité affectée</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={maxQuantity}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Description détaillée de l'anomalie" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deviation_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro de déviation (optionnel)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: DEV-2025-001" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            Enregistrer l'anomalie
          </Button>
        </div>
      </form>
    </Form>
  );
}
