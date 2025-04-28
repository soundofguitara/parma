
import React, { useState } from 'react';
import { 
  BarChart3, 
  PackageCheck, 
  Plus, 
  Search, 
  Timer, 
  UserPlus,
  Edit,
  Trash2
} from 'lucide-react';
import { useOperators } from '@/hooks/useOperators';
import AddOperatorModal from "@/components/modal/AddOperatorModal";
import EditOperatorModal from "@/components/modal/EditOperatorModal";
import { Button } from "@/components/ui/button";

const Operators = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<any>(null);

  const { data: operators = [], isLoading } = useOperators();

  const filteredOperators = operators.filter((op: any) =>
    op.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (operator: any) => {
    setSelectedOperator(operator);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Opérateurs</h1>
        <button
          className="flex items-center gap-2 bg-pharma-accent-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => setAddModalOpen(true)}
        >
          <UserPlus size={18} />
          <span>Nouvel opérateur</span>
        </button>
      </div>

      <AddOperatorModal 
        open={addModalOpen} 
        onClose={() => setAddModalOpen(false)} 
      />
      
      {selectedOperator && (
        <EditOperatorModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedOperator(null);
          }}
          operator={selectedOperator}
        />
      )}

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <h3 className="stat-card-header">Total opérateurs</h3>
          <div className="stat-card-value">{operators.length}</div>
          <div className="text-sm text-pharma-text-muted mt-1">—</div>
        </div>
        
        <div className="stat-card">
          <h3 className="stat-card-header">Vitesse moyenne</h3>
          <div className="stat-card-value">
            {operators.length
              ? Math.round(operators.reduce((sum: any, op: any) => sum + (op.productivity || 0), 0) / operators.length)
              : 0} boîtes/h
          </div>
        </div>
        
        <div className="stat-card">
          <h3 className="stat-card-header">Boîtes vignettées</h3>
          <div className="stat-card-value">
            {operators.reduce((sum: any, op: any) => sum + (op.totalBoxesProcessed || 0), 0).toLocaleString()}
          </div>
        </div>
        
        <div className="stat-card">
          <h3 className="stat-card-header">Temps total</h3>
          <div className="stat-card-value">
            {operators.length
              ? Math.round(operators.reduce((sum: any, op: any) => sum + (op.totalTimeSpent || 0), 0) / 60)
              : 0} h
          </div>
        </div>
      </div>
      
      {/* Operators table */}
      <div className="bg-pharma-blue-light rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-pharma-blue-dark">
          <h2 className="text-xl font-bold text-white">Liste des opérateurs</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 rounded-lg bg-pharma-blue-dark text-white border-none focus:outline-none focus:ring-2 focus:ring-pharma-accent-blue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pharma-blue-dark/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-pharma-text-muted uppercase tracking-wider">Opérateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pharma-text-muted uppercase tracking-wider">
                  <div className="flex items-center">
                    <BarChart3 size={14} className="mr-1" />
                    Efficacité
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pharma-text-muted uppercase tracking-wider">
                  <div className="flex items-center">
                    <Timer size={14} className="mr-1" />
                    Vitesse
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pharma-text-muted uppercase tracking-wider">
                  <div className="flex items-center">
                    <PackageCheck size={14} className="mr-1" />
                    Boîtes traitées
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pharma-text-muted uppercase tracking-wider">Tâches</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-pharma-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pharma-blue-dark/50">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="text-center text-pharma-text-light py-4">Chargement…</td>
                </tr>
              )}
              {filteredOperators.map((operator: any) => (
                <tr key={operator.id} className="hover:bg-pharma-blue-dark/20">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-pharma-accent-blue flex items-center justify-center text-white font-bold">
                        {operator.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{operator.name}</div>
                        <div className="text-sm text-pharma-text-muted">ID: {operator.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="ml-2 text-white">{operator.efficiency}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {operator.productivity} boîtes/h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {operator.totalBoxesProcessed?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{operator.totalAssignments} assignées</div>
                    <div className="text-xs text-pharma-text-muted">
                      {operator.completedOnTime} terminées à temps
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      onClick={() => handleEdit(operator)}
                      variant="ghost" 
                      size="icon"
                      className="mr-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredOperators.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-pharma-text-light py-4">
                    Aucun opérateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Operators;
