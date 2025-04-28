
import React, { useState } from 'react';
import { Plus, Search, SortAsc, SortDesc } from 'lucide-react';
import BatchProgressCard from '@/components/dashboard/BatchProgressCard';
import { useBatches } from '@/hooks/useBatches';
import AddBatchModal from "@/components/modal/AddBatchModal";
import EditBatchModal from "@/components/modal/EditBatchModal";
import { Batch } from '@/types';

const Batches = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);

  const { data: batches = [], isLoading } = useBatches();

  // Filter and sort batches
  const filteredBatches = (batches as any[])
    .filter(batch =>
      (statusFilter === 'all' || batch.status === statusFilter) &&
      (batch.medication_name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        batch.code?.toLowerCase()?.includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'code':
          return sortDirection === 'asc'
            ? a.code.localeCompare(b.code)
            : b.code.localeCompare(a.code);
        case 'name':
          return sortDirection === 'asc'
            ? a.medication_name.localeCompare(b.medication_name)
            : b.medication_name.localeCompare(a.medication_name);
        case 'progress':
          const progressA = (a.processed_boxes / a.total_boxes) * 100;
          const progressB = (b.processed_boxes / b.total_boxes) * 100;
          return sortDirection === 'asc' ? progressA - progressB : progressB - progressA;
        case 'date':
        default:
          const dateA = new Date(a.expected_completion_date).getTime();
          const dateB = new Date(b.expected_completion_date).getTime();
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

  // Handle sort change
  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
  };

  const handleEditBatch = (batch: Batch) => {
    setCurrentBatch(batch);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestion des lots</h1>
        <button
          className="flex items-center gap-2 bg-pharma-accent-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => setAddModalOpen(true)}
        >
          <Plus size={18} />
          <span>Nouveau lot</span>
        </button>
      </div>

      <AddBatchModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
      {currentBatch && (
        <EditBatchModal 
          open={editModalOpen} 
          onClose={() => setEditModalOpen(false)} 
          batch={currentBatch} 
        />
      )}

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom ou code..."
            className="pl-10 pr-4 py-2 w-full rounded-lg bg-pharma-blue-light text-white border-none focus:outline-none focus:ring-2 focus:ring-pharma-accent-blue"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <select
            className="bg-pharma-blue-light text-white rounded-lg px-4 py-2 border-none focus:outline-none focus:ring-2 focus:ring-pharma-accent-blue"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in-progress">En cours</option>
            <option value="completed">Terminé</option>
            <option value="delayed">En retard</option>
          </select>

          <select
            className="bg-pharma-blue-light text-white rounded-lg px-4 py-2 border-none focus:outline-none focus:ring-2 focus:ring-pharma-accent-blue"
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
          >
            <option value="date">Trier par date</option>
            <option value="code">Trier par code</option>
            <option value="name">Trier par nom</option>
            <option value="progress">Trier par progression</option>
          </select>

          <button
            className="bg-pharma-blue-light text-white p-2 rounded-lg hover:bg-pharma-blue-dark transition-colors"
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
          >
            {sortDirection === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
          </button>
        </div>
      </div>

      {/* Batch cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-pharma-blue-light rounded-lg">
            <p className="text-pharma-text-light text-xl font-medium">Chargement...</p>
          </div>
        )}
        {filteredBatches.map((batch: any) => {
          // Convertir les données du format DB en format du composant
          const batchData = {
            id: batch.id,
            code: batch.code,
            medicationName: batch.medication_name,
            totalBoxes: batch.total_boxes,
            processedBoxes: batch.processed_boxes,
            receivedDate: batch.received_date,
            expectedCompletionDate: batch.expected_completion_date,
            status: batch.status,
            assignments: batch.assignments || [],
          };
          
          return (
            <BatchProgressCard
              key={batch.id}
              batch={batchData}
              onEdit={handleEditBatch}
            />
          );
        })}
        {!isLoading && filteredBatches.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-pharma-blue-light rounded-lg">
            <p className="text-pharma-text-light text-xl font-medium">Aucun lot trouvé</p>
            <p className="text-pharma-text-muted mt-2">Essayez de modifier vos filtres de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Batches;
