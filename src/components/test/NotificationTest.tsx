import React from 'react';
import { Button } from '@/components/ui/button';
import { useNotificationService } from '@/hooks/useNotificationService';
import { Batch } from '@/types';

/**
 * Composant de test pour les notifications
 * Ce composant peut être utilisé temporairement pour tester le système de notifications
 */
const NotificationTest: React.FC = () => {
  const { notifyBatchCompleted, notifyBatchNearlyCompleted, notifyBatchDelayed, notify } = useNotificationService();

  // Exemple de lot pour les tests
  const testBatch: Batch = {
    id: 'test-batch-' + Date.now(),
    code: '23500',
    medicationName: 'Diamicron',
    totalBoxes: 1000,
    processedBoxes: 950,
    receivedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours avant
    expectedCompletionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 jours après
    status: 'in-progress',
    assignments: []
  };

  // Lot complété
  const completedBatch: Batch = {
    ...testBatch,
    id: 'completed-batch-' + Date.now(),
    processedBoxes: 1000,
    status: 'completed'
  };

  // Lot en retard
  const delayedBatch: Batch = {
    ...testBatch,
    id: 'delayed-batch-' + Date.now(),
    processedBoxes: 600,
    expectedCompletionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 jours avant
    status: 'delayed'
  };

  return (
    <div className="p-4 bg-pharma-blue-dark rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Test des notifications</h2>
      <div className="flex flex-col gap-2">
        <Button 
          onClick={() => notifyBatchCompleted(completedBatch)}
          className="bg-green-600 hover:bg-green-700"
        >
          Tester notification de lot complété
        </Button>
        
        <Button 
          onClick={() => notifyBatchNearlyCompleted(testBatch)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Tester notification de lot presque complété
        </Button>
        
        <Button 
          onClick={() => notifyBatchDelayed(delayedBatch)}
          className="bg-red-600 hover:bg-red-700"
        >
          Tester notification de lot en retard
        </Button>
        
        <Button 
          onClick={() => notify('Notification de test', 'Ceci est une notification de test générique.', 'info')}
          className="bg-gray-600 hover:bg-gray-700"
        >
          Tester notification générique
        </Button>
      </div>
    </div>
  );
};

export default NotificationTest;
