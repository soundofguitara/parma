import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useBatches } from '@/hooks/useBatches';
import { usePlanning } from '@/hooks/usePlanning';
import AddBatchModal from "@/components/modal/AddBatchModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PlanningModal } from '@/components/planning/PlanningModal';

interface PlanningItemProps {
  planning: any;
  onEdit: (planning: any) => void;
  onDelete: (id: string) => void;
}

const PlanningItem: React.FC<PlanningItemProps> = ({ planning, onEdit, onDelete }) => {
  // Affichage des dates formatées
  const formattedStart = format(new Date(planning.planned_start_date), 'dd/MM/yyyy');
  const formattedEnd = format(new Date(planning.planned_end_date), 'dd/MM/yyyy');
  
  return (
    <div className="bg-pharma-blue-light p-4 rounded-lg border-l-4" 
      style={{ borderLeftColor: '#0EA5E9' }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-white font-medium">{planning.batches?.medication_name}</h3>
          <p className="text-pharma-text-muted text-sm">Lot #{planning.batches?.code}</p>
        </div>
        <div className={cn(
          "px-2 py-1 rounded text-xs font-semibold",
          'bg-pharma-accent-blue/20 text-pharma-accent-blue'
        )}>
          Planifié
        </div>
      </div>
      
      <div className="mt-3 space-y-2">
        <div className="flex items-center text-pharma-text-light text-sm">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <span>{formattedStart} - {formattedEnd}</span>
        </div>
        <div className="flex items-center text-pharma-text-light text-sm">
          <Clock className="h-4 w-4 mr-2" />
          <span>Priorité: {planning.priority}</span>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-pharma-text-light">
          {planning.required_operators} opérateur{planning.required_operators > 1 ? 's' : ''} requis
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(planning)}>
            <Edit size={16} className="text-pharma-text-light hover:text-white" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(planning.id)}>
            <Trash size={16} className="text-pharma-text-light hover:text-pharma-accent-red" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const Planning = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanning, setSelectedPlanning] = useState<any>(null);
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchFilter, setBatchFilter] = useState<string>("all");
  
  const { data: batches = [] } = useBatches();
  const { planningItems, isLoading, addPlanning, updatePlanning, deletePlanning } = usePlanning();
  
  const [form, setForm] = useState({
    batchId: "",
    plannedStartDate: format(new Date(), 'yyyy-MM-dd'),
    plannedEndDate: format(new Date(), 'yyyy-MM-dd'),
    requiredOperators: 1,
    priority: 2,
    notes: ""
  });

  const handleAddPlanning = () => {
    setSelectedPlanning(null);
    setForm({
      batchId: "",
      plannedStartDate: format(new Date(), 'yyyy-MM-dd'),
      plannedEndDate: format(new Date(), 'yyyy-MM-dd'),
      requiredOperators: 1,
      priority: 2,
      notes: ""
    });
    setIsModalOpen(true);
  };
  
  const handleEditPlanning = (planning: any) => {
    setSelectedPlanning(planning);
    setForm({
      batchId: planning.batch_id,
      plannedStartDate: format(parseISO(planning.planned_start_date), 'yyyy-MM-dd'),
      plannedEndDate: format(parseISO(planning.planned_end_date), 'yyyy-MM-dd'),
      requiredOperators: planning.required_operators,
      priority: planning.priority,
      notes: planning.notes || ""
    });
    setIsModalOpen(true);
  };
  
  const handleDeletePlanning = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette planification ?')) {
      try {
        await deletePlanning.mutateAsync(id);
        toast({
          description: "Planification supprimée avec succès",
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          description: `Erreur: ${error.message}`,
        });
      }
    }
  };

  const validateForm = () => {
    if (!form.batchId) {
      toast({
        variant: "destructive",
        description: "Veuillez sélectionner un lot",
      });
      return false;
    }

    const startDate = new Date(form.plannedStartDate);
    const endDate = new Date(form.plannedEndDate);

    if (endDate < startDate) {
      toast({
        variant: "destructive",
        description: "La date de fin doit être postérieure à la date de début",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const planningData = {
        batch_id: form.batchId,
        planned_start_date: form.plannedStartDate,
        planned_end_date: form.plannedEndDate,
        required_operators: Number(form.requiredOperators),
        priority: Number(form.priority),
        notes: form.notes
      };

      if (selectedPlanning) {
        await updatePlanning.mutateAsync({
          id: selectedPlanning.id,
          ...planningData
        });
        toast({
          description: "Planification mise à jour avec succès"
        });
      } else {
        await addPlanning.mutateAsync(planningData);
        toast({
          description: "Nouvelle planification créée avec succès"
        });
      }
      
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Erreur de planification:", error);
      toast({
        variant: "destructive",
        description: `Erreur: ${error.message || "Une erreur s'est produite"}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const getFilteredPlannings = () => {
    let filteredItems = planningItems;
    
    // Filtrer par lot si un filtre est sélectionné
    if (batchFilter !== "all") {
      filteredItems = filteredItems.filter(item => item.batch_id === batchFilter);
    }
    
    // Filtrer par date/vue
    return filteredItems.filter(item => {
      const startDate = new Date(item.planned_start_date);
      const endDate = new Date(item.planned_end_date);
      
      if (view === 'day') {
        return isSameDay(date, startDate) || 
               (date >= startDate && date <= endDate);
      } else if (view === 'week') {
        const weekStart = new Date(date);
        const weekEnd = addDays(new Date(date), 6);
        
        return (
          (startDate >= weekStart && startDate <= weekEnd) || 
          (endDate >= weekStart && endDate <= weekEnd) ||
          (startDate <= weekStart && endDate >= weekEnd)
        );
      } else {
        // Vue mois
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        return (
          (startDate >= monthStart && startDate <= monthEnd) ||
          (endDate >= monthStart && endDate <= monthEnd) ||
          (startDate <= monthStart && endDate >= monthEnd)
        );
      }
    });
  };
  
  const filteredPlannings = getFilteredPlannings();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pharma-accent-blue"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Planification</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsAddBatchModalOpen(true)} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Nouveau lot
          </Button>
          <Button onClick={handleAddPlanning} className="flex items-center gap-2">
            <Plus size={16} />
            Nouvelle planification
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-pharma-blue-light border-none text-white flex gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                {format(date, 'PP', { locale: fr })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Select value={view} onValueChange={(value) => setView(value as any)}>
            <SelectTrigger className="w-[150px] bg-pharma-blue-light border-none text-white">
              <SelectValue placeholder="Vue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Journalière</SelectItem>
              <SelectItem value="week">Hebdomadaire</SelectItem>
              <SelectItem value="month">Mensuelle</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={batchFilter} onValueChange={setBatchFilter}>
            <SelectTrigger className="w-[200px] bg-pharma-blue-light border-none text-white">
              <SelectValue placeholder="Filtrer par lot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les lots</SelectItem>
              {batches.map((batch: any) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.code} - {batch.medicationName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlannings.length > 0 ? (
          filteredPlannings.map((item) => (
            <PlanningItem
              key={item.id}
              planning={item}
              onEdit={handleEditPlanning}
              onDelete={handleDeletePlanning}
            />
          ))
        ) : (
          <div className="col-span-full p-8 bg-pharma-blue-light rounded-lg text-center">
            <p className="text-pharma-text-light mb-2">Aucune planification pour cette période</p>
            <Button onClick={handleAddPlanning} className="mt-2">
              <Plus size={16} className="mr-2" />
              Ajouter une planification
            </Button>
          </div>
        )}
      </div>

      <AddBatchModal
        open={isAddBatchModalOpen}
        onClose={() => setIsAddBatchModalOpen(false)}
      />
      
      <PlanningModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        handleChange={handleChange}
        batches={batches}
        isEditing={!!selectedPlanning}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Planning;
