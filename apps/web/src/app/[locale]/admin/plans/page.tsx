'use client';

/**
 * Plans Management Page
 * Admin page for managing subscription plans
 */

import { useState, useEffect } from 'react';
import { PageHeader, PageContainer } from '@/components/layout';
import { Card, Button, Input, Textarea, Badge, Alert, Modal } from '@/components/ui';
import { subscriptionsAPI } from '@/lib/api';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';
import { Edit2, Save, X, Loader2, Plus } from 'lucide-react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

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
  stripe_price_id: string | null;
  stripe_product_id: string | null;
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    amount: '',
    currency: 'eur',
    interval: 'month', // Backend expects lowercase
    interval_count: 1,
    is_popular: false,
    features: '',
  });

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
        stripe_price_id: plan.stripe_price_id || '',
        stripe_product_id: plan.stripe_product_id || '',
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

      // Prepare update data - convert empty strings to null
      const updateData: {
        name?: string;
        description?: string | null;
        amount?: number;
        is_popular?: boolean;
        features?: string | null;
        stripe_price_id?: string | null;
        stripe_product_id?: string | null;
      } = {
        name: editedPlan.name,
        description: editedPlan.description || null,
        amount: amountInCents,
        is_popular: editedPlan.is_popular,
        features: editedPlan.features || null,
      };

      // Handle Stripe IDs - convert empty strings to null, preserve non-empty strings
      const stripePriceId = editedPlan.stripe_price_id as string | undefined;
      const stripeProductId = editedPlan.stripe_product_id as string | undefined;
      
      updateData.stripe_price_id = stripePriceId && stripePriceId.trim() ? stripePriceId.trim() : null;
      updateData.stripe_product_id = stripeProductId && stripeProductId.trim() ? stripeProductId.trim() : null;

      await subscriptionsAPI.updatePlan(planId, updateData);

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

  const handleCreatePlan = async () => {
    try {
      setCreatingPlan(true);
      setError(null);
      setSuccess(null);

      // Convert amount from euros to cents
      const amountInCents = Math.round(parseFloat(newPlan.amount) * 100);

      await subscriptionsAPI.createPlan({
        name: newPlan.name,
        description: newPlan.description || null,
        amount: amountInCents,
        currency: newPlan.currency,
        interval: newPlan.interval, // Already in lowercase
        interval_count: newPlan.interval_count,
        is_popular: newPlan.is_popular,
        features: newPlan.features || null,
      });

      setSuccess(`Plan "${newPlan.name}" créé avec succès`);
      setShowCreateModal(false);
      setNewPlan({
        name: '',
        description: '',
        amount: '',
        currency: 'eur',
        interval: 'month',
        interval_count: 1,
        is_popular: false,
        features: '',
      });
      
      // Reload plans
      await loadPlans();
    } catch (err: any) {
      console.error('Error creating plan:', err);
      setError(err?.response?.data?.detail || err?.message || 'Erreur lors de la création du plan');
    } finally {
      setCreatingPlan(false);
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
      <>
        <Header />
        <div className="pt-16 min-h-screen">
          <PageContainer>
            <PageHeader
              title="Gestion des Plans"
              description="Gérer les plans d'abonnement"
              titleClassName="text-white"
              descriptionClassName="text-white"
            />
            <div className="mt-6 flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </PageContainer>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="pt-16 min-h-screen">
        <PageContainer>
          <PageHeader
            title="Gestion des Plans"
            description="Gérer les plans d'abonnement - Modifier les prix, descriptions et fonctionnalités"
            titleClassName="text-white"
            descriptionClassName="text-white"
            actions={
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer un plan
              </Button>
            }
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

      {plans.length === 0 && !isLoading && (
        <Card className="mt-6 p-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Aucun plan disponible</h3>
            <p className="text-muted-foreground mb-6">
              Il n'y a actuellement aucun plan d'abonnement dans la base de données.
            </p>
            <div className="bg-muted p-6 rounded-lg text-left max-w-2xl mx-auto">
              <h4 className="font-semibold mb-3">Pour créer des plans :</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Connectez-vous à votre serveur backend (Railway, SSH, etc.)</li>
                <li>Naviguez vers le dossier <code className="bg-background px-2 py-1 rounded">backend</code></li>
                <li>Exécutez le script de seed : <code className="bg-background px-2 py-1 rounded">python scripts/seed_plans.py</code></li>
                <li>Rechargez cette page</li>
              </ol>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium mb-2">Le script créera 3 plans par défaut :</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Basic</strong> : 49€/mois</li>
                  <li><strong>Professional</strong> : 99€/mois (Le plus populaire)</li>
                  <li><strong>Enterprise</strong> : Sur devis</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}

      {plans.length > 0 && (
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
                          className="flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Enregistrer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(plan.id)}
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Annuler
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(plan)}
                        className="flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
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

                {/* Stripe Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Stripe Price ID
                    </label>
                    {isEditing ? (
                      <Input
                        value={editedPlan.stripe_price_id || ''}
                        onChange={(e) => handleChange(plan.id, 'stripe_price_id', e.target.value)}
                        placeholder="price_xxxxxxxxxxxxx"
                        className="font-mono text-sm"
                      />
                    ) : (
                      <p className="text-foreground font-mono text-sm">
                        {plan.stripe_price_id || <span className="text-muted-foreground italic">Non configuré</span>}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      ID du prix Stripe (commence par price_)
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Stripe Product ID
                    </label>
                    {isEditing ? (
                      <Input
                        value={editedPlan.stripe_product_id || ''}
                        onChange={(e) => handleChange(plan.id, 'stripe_product_id', e.target.value)}
                        placeholder="prod_xxxxxxxxxxxxx"
                        className="font-mono text-sm"
                      />
                    ) : (
                      <p className="text-foreground font-mono text-sm">
                        {plan.stripe_product_id || <span className="text-muted-foreground italic">Non configuré</span>}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      ID du produit Stripe (commence par prod_)
                    </p>
                  </div>
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
      )}

      {/* Create Plan Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewPlan({
            name: '',
            description: '',
            amount: '',
            currency: 'eur',
            interval: 'MONTH',
            interval_count: 1,
            is_popular: false,
            features: '',
          });
          setError(null);
        }}
        title="Créer un nouveau plan"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setNewPlan({
                  name: '',
                  description: '',
                  amount: '',
                  currency: 'eur',
                  interval: 'MONTH',
                  interval_count: 1,
                  is_popular: false,
                  features: '',
                });
                setError(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleCreatePlan}
              disabled={creatingPlan || !newPlan.name || !newPlan.amount}
              className="flex items-center gap-2"
            >
              {creatingPlan ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer le plan'
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom du plan *</label>
            <Input
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              placeholder="Ex: Basic, Professional, Enterprise"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={newPlan.description}
              onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
              placeholder="Description du plan"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prix (€) *</label>
              <Input
                type="number"
                step="0.01"
                value={newPlan.amount}
                onChange={(e) => setNewPlan({ ...newPlan, amount: e.target.value })}
                placeholder="49.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Devise</label>
              <select
                value={newPlan.currency}
                onChange={(e) => setNewPlan({ ...newPlan, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="eur">EUR (€)</option>
                <option value="usd">USD ($)</option>
                <option value="gbp">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Intervalle</label>
              <select
                value={newPlan.interval}
                onChange={(e) => setNewPlan({ ...newPlan, interval: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="month">Mensuel</option>
                <option value="year">Annuel</option>
                <option value="week">Hebdomadaire</option>
                <option value="day">Quotidien</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nombre d'intervalles</label>
              <Input
                type="number"
                min="1"
                value={newPlan.interval_count}
                onChange={(e) => setNewPlan({ ...newPlan, interval_count: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newPlan.is_popular}
                onChange={(e) => setNewPlan({ ...newPlan, is_popular: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Marquer comme populaire</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fonctionnalités (JSON)</label>
            <Textarea
              value={newPlan.features}
              onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
              placeholder='{"feature1": true, "feature2": "value"}'
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format JSON optionnel pour les fonctionnalités du plan
            </p>
          </div>
        </div>
      </Modal>
        </PageContainer>
      </div>
      <Footer />
    </>
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
