import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { AnomalyType, AnomalyStatus, AnomalyChecklist } from '@/types';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import { useBatches } from '@/hooks/useBatches';
import { useOperators } from '@/hooks/useOperators';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface EnhancedAnomalyFormProps {
  batchId: string;
  batchCode?: string;
  medicationName?: string;
  operatorId: string;
  operatorName?: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  maxQuantity?: number;
  assignmentId?: string;
}

export default function EnhancedAnomalyForm({
  batchId,
  batchCode,
  medicationName,
  operatorId,
  operatorName,
  onSubmit,
  onCancel,
  maxQuantity = 1000,
  assignmentId
}: EnhancedAnomalyFormProps) {
  // Récupérer la liste des lots et des opérateurs
  const { data: batches = [] } = useBatches();
  const { data: operators = [] } = useOperators();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batchId || '');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(operatorId || '');

  // Trouver le lot sélectionné
  const selectedBatch = batches.find((batch: any) => batch.id === selectedBatchId);
  const selectedBatchMaxQuantity = selectedBatch ? selectedBatch.totalBoxes - selectedBatch.processedBoxes : maxQuantity;

  const form = useForm({
    defaultValues: {
      type: 'damaged_box' as AnomalyType,
      quantity: 1,
      description: '',
      deviation_number: '',
      status: 'pending' as AnomalyStatus,
      remaining_quantity: 0,
      sap_declared: false,
      deviation_created: false,
      moved_to_hold: false,
      pf_manager_informed: false,
      qa_informed: false,
    }
  });

  // Mettre à jour le lot et l'opérateur sélectionnés lorsque les props changent
  useEffect(() => {
    if (batchId) {
      setSelectedBatchId(batchId);
    }
    if (operatorId) {
      setSelectedOperatorId(operatorId);
    }
  }, [batchId, operatorId]);

  const anomalyTypes = [
    { value: 'damaged_box', label: 'Boîte abîmée' },
    { value: 'empty_case', label: 'Étuis vides' },
    { value: 'missing_from_original', label: 'Manque dans un colis d\'origine' },
    { value: 'other', label: 'Autre anomalie' }
  ];

  const handleSubmit = async (data: any) => {
    // Vérifier si un lot est sélectionné
    if (!selectedBatchId) {
      toast({
        variant: "destructive",
        description: "Veuillez sélectionner un lot."
      });
      return;
    }

    // Vérifier si un opérateur est sélectionné
    if (!selectedOperatorId) {
      toast({
        variant: "destructive",
        description: "Veuillez sélectionner un opérateur."
      });
      return;
    }

    // Vérifier si une date est sélectionnée
    if (!selectedDate) {
      toast({
        variant: "destructive",
        description: "Veuillez sélectionner une date de détection."
      });
      return;
    }



    if (data.quantity > selectedBatchMaxQuantity) {
      toast({
        variant: "destructive",
        description: `La quantité ne peut pas dépasser ${selectedBatchMaxQuantity} boîtes.`
      });
      return;
    }

    // Vérifier si la quantité restante est valide
    if (data.remaining_quantity !== undefined && data.remaining_quantity < 0) {
      toast({
        variant: "destructive",
        description: "La quantité restante ne peut pas être négative."
      });
      return;
    }

    onSubmit({
      ...data,
      assignment_id: assignmentId,
      batch_id: selectedBatchId,
      operator_id: selectedOperatorId,
      detection_date: selectedDate.toISOString()
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="bg-pharma-blue-dark p-4 rounded-lg mb-4">
          <h3 className="text-white text-lg font-semibold mb-2">Informations de l'anomalie</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
            {/* Sélection de la date */}
            <div className="space-y-2">
              <Label htmlFor="detection_date" className="text-pharma-text-light text-sm">Date et heure de détection</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: fr }) : <span>Sélectionner une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Sélection de l'opérateur */}
            <div className="space-y-2">
              <Label htmlFor="operator_id" className="text-pharma-text-light text-sm">Opérateur</Label>
              <Select
                value={selectedOperatorId}
                onValueChange={setSelectedOperatorId}
              >
                <SelectTrigger className="bg-pharma-blue-dark border-pharma-blue-dark text-white">
                  <SelectValue placeholder="Sélectionner un opérateur" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((operator: any) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      {operator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sélection du lot */}
            <div className="space-y-2">
              <Label htmlFor="batch_id" className="text-pharma-text-light text-sm">Lot</Label>
              <Select
                value={selectedBatchId}
                onValueChange={(value) => {
                  setSelectedBatchId(value);
                }}
              >
                <SelectTrigger className="bg-pharma-blue-dark border-pharma-blue-dark text-white">
                  <SelectValue placeholder="Sélectionner un lot" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch: any) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.code} – {batch.medicationName || 'Sans nom'} ({batch.totalBoxes - batch.processedBoxes} boîtes disponibles)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Colonne 1 */}
          <div className="space-y-4">
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
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {anomalyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Désignation de l'anomalie</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Description détaillée (ex: Boîte abimée, boite manquante, étui vide)"
                      className="resize-none"
                      rows={3}
                    />
                  </FormControl>
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
                  <FormDescription>
                    Nombre de boîtes manquantes ou défectueuses
                  </FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={maxQuantity}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remaining_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité restante (après exclusion)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


          </div>

          {/* Colonne 2 - Checklist et photos */}
          <div className="space-y-4">
            <Card className="border-pharma-blue-dark bg-pharma-blue-dark/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base">Actions effectuées ✅</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="sap_declared"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-white">
                          Déclaration dans SAP de la quantité affectée
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deviation_created"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            // Si on décoche, on efface le numéro de déviation
                            if (!checked) {
                              form.setValue('deviation_number', '');
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-white">
                          Déclaration d'une déviation (si applicable)
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('deviation_created') && (
                  <FormField
                    control={form.control}
                    name="deviation_number"
                    render={({ field }) => (
                      <FormItem className="ml-7">
                        <FormLabel className="text-white">N° de la déviation</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: DEV-2025-001" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}



                <FormField
                  control={form.control}
                  name="moved_to_hold"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-white">
                          Écarté dans la zone HOLD
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pf_manager_informed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-white">
                          Responsable PF informé
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qa_informed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-white">
                          AQ informé (si nécessaire)
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>


          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="resolution_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commentaires libres (optionnel)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Informations complémentaires sur l'anomalie"
                    className="resize-none"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
