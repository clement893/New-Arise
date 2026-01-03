'use client';

/**
 * Plans Management Page
 * Admin page for managing subscription plans
 */

import { useState, useEffect } from 'react';
import { PageHeader, PageContainer } from '@/components/layout';
import { Card, Button, Input, Textarea, Badge, Alert } from '@/components/ui';
import { subscriptionsAPI } from '@/lib/api';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';
import { Edit2, Save, X, Loader2 } from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  description: string | null;
  amount: number; // in cents
  currency: string;
  interval: string;
  interval_count: number;
  status: string;
  is_popular: boolean;
  features: string | null;
  created_at: string;
  updated_at: string;
}

function PlansPageContent() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [editedPlans, setEditedPlans] = useState<Record<number, Partial<Plan>>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await subscriptionsAPI.getPlans(false); // Get all plans, not just active
      setPlans(response.data?.plans || []);
    } catch (err) {
      console.error('Error loading plans:', err);
      setError('Erreur lors du chargement des plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setEditedPlans({
      ...editedPlans,
      [plan.id]: {
        name: plan.name,
        description: plan.description || '',
        amount: plan.amount,
        is_popular: plan.is_popular,
        features: plan.features || '',
      },
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancel = (planId: number) => {
    setEditingPlanId(null);
    const newEdited = { ...editedPlans };
    delete newEdited[planId];
    setEditedPlans(newEdited);
  };

  const handleChange = (planId: number, field: keyof Plan, value: string | number | boolean) => {
    setEditedPlans({
      ...editedPlans,
      [planId]: {
        ...editedPlans[planId],
        [field]: value,
      },
    });
  };

  const handleSave = async (planId: number) => {
    try {
      setError(null);
      setSuccess(null);
      
      const editedPlan = editedPlans[planId];
      if (!editedPlan) return;

      // Convert amount from euros to cents if it's a number
      const amountInCents = typeof editedPlan.amount === 'number' 
        ? Math.round(editedPlan.amount * 100) 
        : editedPlan.amount;

      await subscriptionsAPI.updatePlan(planId, {
        name: editedPlan.name,
        description: editedPlan.description || null,
        amount: amountInCents,
        is_popular: editedPlan.is_popular,
        features: editedPlan.features || null,
      });

      setSuccess(`Plan "${editedPlan.name}" mis à jour avec succès`);
      setEditingPlanId(null);
      const newEdited = { ...editedPlans };
      delete newEdited[planId];
      setEditedPlans(newEdited);
      
      // Reload plans
      await loadPlans();
    } catch (err) {
      console.error('Error updating plan:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du plan');
    }
  };

  const formatPrice = (amount: number) => {
    if (amount === 0) return 'Sur devis';
    return `${(amount / 100).toFixed(2)}€`;
  };

  const parseFeatures = (features: string | null): Record<string, any> => {
    if (!features) return {};
    try {
      return JSON.parse(features);
    } catch {
      return {};
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Gestion des Plans"
          description="Gérer les plans d'abonnement"
          breadcrumbs={[
            { label: 'Accueil', href: '/' },
            { label: 'Administration', href: '/admin' },
            { label: 'Plans' },
          ]}
        />
        <div className="mt-6 flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Gestion des Plans"
        description="Gérer les plans d'abonnement - Modifier les prix, descriptions et fonctionnalités"
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Administration', href: '/admin' },
          { label: 'Plans' },
        ]}
      />

      {error && (
        <Alert variant="error" className="mt-6">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mt-6">
          {success}
        </Alert>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6">
        {plans.map((plan) => {
          const isEditing = editingPlanId === plan.id;
          const editedPlan = editedPlans[plan.id] || plan;
          const features = parseFeatures(editedPlan.features || plan.features);

          return (
            <Card key={plan.id} className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {isEditing ? (
                      <Input
                        value={editedPlan.name || ''}
                        onChange={(e) => handleChange(plan.id, 'name', e.target.value)}
                        placeholder="Nom du plan"
                        className="text-2xl font-bold"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                        {plan.is_popular && (
                          <Badge variant="info">Le plus populaire</Badge>
                        )}
                        <Badge variant={plan.status === 'ACTIVE' ? 'success' : 'default'}>
                          {plan.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSave(plan.id)}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Enregistrer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(plan.id)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Annuler
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(plan)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  {isEditing ? (
                    <Textarea
                      value={editedPlan.description || ''}
                      onChange={(e) => handleChange(plan.id, 'description', e.target.value)}
                      placeholder="Description du plan"
                      rows={2}
                    />
                  ) : (
                    <p className="text-muted-foreground">{plan.description || 'Aucune description'}</p>
                  )}
                </div>

                {/* Price and Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">
                      Prix
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={typeof editedPlan.amount === 'number' ? (editedPlan.amount / 100).toFixed(2) : ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          handleChange(plan.id, 'amount', Math.round(value * 100));
                        }}
                        placeholder="Prix en euros"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-foreground">
                        {formatPrice(plan.amount)} / {plan.interval.toLowerCase()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">
                      Devise
                    </label>
                    <p className="text-foreground uppercase">{plan.currency}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">
                      Plan populaire
                    </label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedPlan.is_popular || false}
                          onChange={(e) => handleChange(plan.id, 'is_popular', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-muted-foreground">Marquer comme populaire</span>
                      </div>
                    ) : (
                      <p className="text-foreground">
                        {plan.is_popular ? 'Oui' : 'Non'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Fonctionnalités (JSON)
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={editedPlan.features || ''}
                      onChange={(e) => handleChange(plan.id, 'features', e.target.value)}
                      placeholder='{"feature1": true, "feature2": "value"}'
                      rows={4}
                      className="font-mono text-sm"
                    />
                  ) : (
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
                        {JSON.stringify(features, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="pt-4 border-t text-xs text-muted-foreground">
                  <p>ID: {plan.id} | Créé le: {new Date(plan.created_at).toLocaleDateString('fr-FR')} | Modifié le: {new Date(plan.updated_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function PlansPage() {
  return (
    <ProtectedSuperAdminRoute>
      <PlansPageContent />
    </ProtectedSuperAdminRoute>
  );
}
