'use client';

import { useState } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, EmptyState, StatsCard, Badge, Button, DataTable, DataTableEnhanced, KanbanBoard, Calendar, CRUDModal, ExportButton, Input } from '@/components/ui';
import type { KanbanCard, KanbanColumn, CalendarEvent } from '@/components/ui';
import { PageHeader, PageContainer, Section, PageNavigation } from '@/components/layout';

const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Moderator', status: 'active' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'pending' },
];

export default function DataPage() {
  const [isCRUDModalOpen, setIsCRUDModalOpen] = useState(false);
  const [crudMode, setCrudMode] = useState<'create' | 'edit' | 'delete' | 'view'>('create');

  const kanbanColumns: KanbanColumn[] = [
    { id: '1', title: 'À faire', status: 'todo', color: '#3B82F6' },
    { id: '2', title: 'En cours', status: 'in-progress', color: '#F59E0B' },
    { id: '3', title: 'Terminé', status: 'done', color: '#10B981' },
  ];

  const kanbanCards: KanbanCard[] = [
    { id: '1', title: 'Tâche 1', description: 'Description de la tâche 1', status: 'todo', priority: 'high', assignee: 'John Doe' },
    { id: '2', title: 'Tâche 2', description: 'Description de la tâche 2', status: 'todo', priority: 'medium', assignee: 'Jane Smith' },
    { id: '3', title: 'Tâche 3', description: 'Description de la tâche 3', status: 'in-progress', priority: 'low', assignee: 'Bob Johnson' },
    { id: '4', title: 'Tâche 4', description: 'Description de la tâche 4', status: 'done', priority: 'high', assignee: 'Alice Brown' },
  ];

  const calendarEvents: CalendarEvent[] = [
    { id: '1', title: 'Réunion équipe', date: new Date(), time: '10:00', color: '#3B82F6' },
    { id: '2', title: 'Présentation client', date: new Date(Date.now() + 86400000), time: '14:00', color: '#10B981' },
    { id: '3', title: 'Deadline projet', date: new Date(Date.now() + 172800000), time: '17:00', color: '#EF4444' },
  ];

  return (
    <PageContainer>
      <PageHeader title="Composants d'Affichage de Données" description="Tableaux, cartes et composants pour afficher des données" breadcrumbs={[{ label: 'Accueil', href: '/' }, { label: 'Composants', href: '/components' }, { label: 'Données' }]} />

      <div className="space-y-8">
        <Section title="StatsCard">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Utilisateurs actifs" value="1,234" change={{ value: 12, type: 'increase', period: 'ce mois' }} icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
            <StatsCard title="Revenus" value="€45,678" change={{ value: 8, type: 'increase', period: 'ce mois' }} icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <StatsCard title="Commandes" value="892" change={{ value: 5, type: 'decrease', period: 'ce mois' }} icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} />
            <StatsCard title="Taux de conversion" value="3.2%" change={{ value: 0.5, type: 'increase', period: 'ce mois' }} icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
          </div>
        </Section>

        <Section title="Table">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader sortable>Nom</TableHeader>
                <TableHeader sortable>Email</TableHeader>
                <TableHeader>Rôle</TableHeader>
                <TableHeader>Statut</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell><Badge variant="info">{row.role}</Badge></TableCell>
                  <TableCell><Badge variant={row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'error'}>{row.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Modifier</Button>
                      <Button variant="ghost" size="sm">Supprimer</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        <Section title="Table avec styles alternés">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Produit</TableHeader>
                <TableHeader>Prix</TableHeader>
                <TableHeader>Stock</TableHeader>
                <TableHeader>Statut</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody striped hover>
              <TableRow><TableCell>Laptop Pro</TableCell><TableCell>€1,299</TableCell><TableCell>15</TableCell><TableCell><Badge variant="success">En stock</Badge></TableCell></TableRow>
              <TableRow><TableCell>Mouse Wireless</TableCell><TableCell>€29</TableCell><TableCell>0</TableCell><TableCell><Badge variant="error">Rupture</Badge></TableCell></TableRow>
              <TableRow><TableCell>Keyboard Mechanical</TableCell><TableCell>€89</TableCell><TableCell>5</TableCell><TableCell><Badge variant="warning">Stock faible</Badge></TableCell></TableRow>
            </TableBody>
          </Table>
        </Section>

        <Section title="EmptyState">
          <div className="space-y-6">
            <EmptyState title="Aucun résultat trouvé" description="Essayez de modifier vos filtres de recherche pour trouver ce que vous cherchez." icon={<svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} action={{ label: 'Réinitialiser les filtres', onClick: () => alert('Filtres réinitialisés') }} />
            <EmptyState title="Aucun élément créé" description="Commencez par créer votre premier élément pour voir apparaître des données ici." icon={<svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>} action={{ label: 'Créer un élément', onClick: () => alert('Création d\'un élément') }} />
          </div>
        </Section>

        <Section title="DataTable">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-4">Tableau de données simple</h4>
              <DataTable
                data={sampleData}
                columns={[
                  { key: 'name', label: 'Nom', sortable: true },
                  { key: 'email', label: 'Email', sortable: true },
                  { key: 'role', label: 'Rôle' },
                  { key: 'status', label: 'Statut' },
                ]}
                pageSize={10}
              />
            </div>
          </div>
        </Section>

        <Section title="DataTableEnhanced">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-4">Tableau de données avancé</h4>
              <DataTableEnhanced
                data={sampleData}
                columns={[
                  { key: 'name', label: 'Nom', sortable: true },
                  { key: 'email', label: 'Email', sortable: true },
                  { key: 'role', label: 'Rôle', filterable: true },
                  { key: 'status', label: 'Statut', filterable: true },
                ]}
                pageSize={10}
                searchable
                selectable
                onSelectionChange={(selected) => console.log('Sélection:', selected)}
              />
            </div>
          </div>
        </Section>

        <Section title="KanbanBoard">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Tableau Kanban avec drag & drop pour gérer les tâches par statut.</p>
            <KanbanBoard
              columns={kanbanColumns}
              cards={kanbanCards}
              onCardMove={(cardId, newStatus) => console.log('Carte déplacée:', cardId, newStatus)}
              onCardClick={(card) => console.log('Carte cliquée:', card)}
              onCardAdd={(status) => console.log('Ajouter une carte au statut:', status)}
            />
          </div>
        </Section>

        <Section title="Calendar">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Calendrier mensuel avec événements.</p>
            <Calendar
              events={calendarEvents}
              onDateClick={(date) => console.log('Date cliquée:', date)}
              onEventClick={(event) => console.log('Événement cliqué:', event)}
            />
          </div>
        </Section>

        <Section title="CRUDModal">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Modal pour les opérations CRUD (Create, Read, Update, Delete).</p>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => { setCrudMode('create'); setIsCRUDModalOpen(true); }} variant="primary">Créer</Button>
              <Button onClick={() => { setCrudMode('edit'); setIsCRUDModalOpen(true); }} variant="outline">Modifier</Button>
              <Button onClick={() => { setCrudMode('view'); setIsCRUDModalOpen(true); }} variant="outline">Voir</Button>
              <Button onClick={() => { setCrudMode('delete'); setIsCRUDModalOpen(true); }} variant="danger">Supprimer</Button>
            </div>
            <CRUDModal
              isOpen={isCRUDModalOpen}
              onClose={() => setIsCRUDModalOpen(false)}
              title={crudMode === 'create' ? 'Créer un élément' : crudMode === 'edit' ? 'Modifier un élément' : crudMode === 'delete' ? 'Supprimer un élément' : 'Voir un élément'}
              mode={crudMode}
              onSubmit={() => { alert(`${crudMode === 'create' ? 'Création' : 'Modification'} réussie !`); setIsCRUDModalOpen(false); }}
              onDelete={crudMode === 'delete' ? () => { alert('Suppression réussie !'); setIsCRUDModalOpen(false); } : undefined}
            >
              {crudMode === 'delete' ? (
                <p className="text-gray-700 dark:text-gray-300">Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.</p>
              ) : (
                <div className="space-y-4">
                  <Input label="Nom" placeholder="Entrez le nom" />
                  <Input label="Email" type="email" placeholder="entrez@email.com" />
                </div>
              )}
            </CRUDModal>
          </div>
        </Section>

        <Section title="ExportButton">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Bouton pour exporter des données en CSV ou Excel.</p>
            <ExportButton
              data={sampleData}
              filename="utilisateurs"
              onExport={(format, data) => {
                console.log(`Export ${format}:`, data);
                alert(`Export ${format} déclenché !`);
              }}
            />
          </div>
        </Section>
      </div>

      <PageNavigation prev={{ label: 'Feedback', href: '/components/feedback' }} next={{ label: 'Utilitaires', href: '/components/utils' }} />
    </PageContainer>
  );
}
