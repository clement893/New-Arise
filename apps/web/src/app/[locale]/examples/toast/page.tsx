'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { useToast } from '@/components/ui';
import { CheckCircle, XCircle, AlertTriangle, Info, Bell } from 'lucide-react';

export default function ExampleToastPage() {
  const { showToast } = useToast();
  const [toastHistory, setToastHistory] = useState<Array<{ type: string; message: string; time: string }>>([]);

  const addToHistory = (type: string, message: string) => {
    setToastHistory((prev) => [
      { type, message, time: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  };

  const handleSuccess = () => {
    showToast({
      message: 'Opération réussie avec succès !',
      type: 'success',
    });
    addToHistory('success', 'Opération réussie avec succès !');
  };

  const handleError = () => {
    showToast({
      message: 'Une erreur est survenue lors de l\'opération',
      type: 'error',
    });
    addToHistory('error', 'Une erreur est survenue lors de l\'opération');
  };

  const handleWarning = () => {
    showToast({
      message: 'Attention : Cette action peut avoir des conséquences',
      type: 'warning',
    });
    addToHistory('warning', 'Attention : Cette action peut avoir des conséquences');
  };

  const handleInfo = () => {
    showToast({
      message: 'Information : Nouvelle fonctionnalité disponible',
      type: 'info',
    });
    addToHistory('info', 'Information : Nouvelle fonctionnalité disponible');
  };

  const handlePersistent = () => {
    showToast({
      message: 'Notification persistante - Cliquez pour fermer',
      type: 'info',
      duration: 0, // 0 = persistent
    });
    addToHistory('persistent', 'Notification persistante');
  };

  const handleCustomDuration = () => {
    showToast({
      message: 'Notification avec durée personnalisée (10 secondes)',
      type: 'success',
      duration: 10000,
    });
    addToHistory('custom', 'Notification avec durée personnalisée');
  };

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Exemple Notifications / Toast
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Système de notifications toast avec différents types et durées
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Toast Types */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Types de Notifications
            </h2>
            <div className="space-y-3">
              <Button
                onClick={handleSuccess}
                variant="outline"
                className="w-full justify-start"
              >
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Notification de succès
              </Button>
              <Button
                onClick={handleError}
                variant="outline"
                className="w-full justify-start"
              >
                <XCircle className="w-4 h-4 mr-2 text-red-600" />
                Notification d'erreur
              </Button>
              <Button
                onClick={handleWarning}
                variant="outline"
                className="w-full justify-start"
              >
                <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
                Notification d'avertissement
              </Button>
              <Button
                onClick={handleInfo}
                variant="outline"
                className="w-full justify-start"
              >
                <Info className="w-4 h-4 mr-2 text-blue-600" />
                Notification d'information
              </Button>
            </div>
          </div>
        </Card>

        {/* Toast Options */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Options Avancées
            </h2>
            <div className="space-y-3">
              <Button
                onClick={handlePersistent}
                variant="outline"
                className="w-full justify-start"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notification persistante
              </Button>
              <Button
                onClick={handleCustomDuration}
                variant="outline"
                className="w-full justify-start"
              >
                <Info className="w-4 h-4 mr-2" />
                Durée personnalisée (10s)
              </Button>
            </div>
          </div>
        </Card>

        {/* Toast History */}
        <Card className="md:col-span-2">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Historique des Notifications
            </h2>
            {toastHistory.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                Aucune notification envoyée
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {toastHistory.map((toast, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {toast.type === 'success' && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {toast.type === 'error' && (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      {toast.type === 'warning' && (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      )}
                      {(toast.type === 'info' || toast.type === 'persistent' || toast.type === 'custom') && (
                        <Info className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {toast.message}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {toast.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Code Example */}
      <Card className="mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Points clés de cet exemple :
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>✅ 4 types de notifications (success, error, warning, info)</li>
            <li>✅ Durée personnalisable</li>
            <li>✅ Notifications persistantes (duration: 0)</li>
            <li>✅ Historique des notifications</li>
            <li>✅ Auto-dismiss configurable</li>
            <li>✅ Icônes contextuelles</li>
          </ul>
        </div>
      </Card>
    </Container>
  );
}


