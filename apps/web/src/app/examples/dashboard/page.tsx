'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

export default function ExampleDashboardPage() {
  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Exemple Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Un exemple de tableau de bord avec widgets et statistiques</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Donateurs</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">1,234</div>
            <div className="text-sm text-green-600 dark:text-green-400 mt-2">+12% ce mois</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-sm text-gray-600 mb-1">Campagnes Actives</div>
            <div className="text-3xl font-bold text-gray-900">8</div>
            <div className="text-sm text-blue-600 mt-2">3 nouvelles</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-sm text-gray-600 mb-1">Montant Collecté</div>
            <div className="text-3xl font-bold text-gray-900">45,678€</div>
            <div className="text-sm text-green-600 mt-2">+8% ce mois</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-sm text-gray-600 mb-1">Taux de Conversion</div>
            <div className="text-3xl font-bold text-gray-900">3.2%</div>
            <div className="text-sm text-purple-600 mt-2">+0.5% ce mois</div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Activité Récente</h2>
            <div className="space-y-4">
              {[
                { name: 'Jean Dupont', action: 'a fait un don de', amount: '50€', time: 'Il y a 2 heures' },
                { name: 'Marie Martin', action: 'a rejoint la campagne', campaign: 'Campagne Hiver', time: 'Il y a 5 heures' },
                { name: 'Pierre Durand', action: 'a mis à jour son profil', time: 'Il y a 1 jour' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">
                      {activity.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-gray-100">
                      <span className="font-semibold">{activity.name}</span> {activity.action}{' '}
                      {activity.amount && <span className="font-semibold text-green-600 dark:text-green-400">{activity.amount}</span>}
                      {activity.campaign && <span className="font-semibold">{activity.campaign}</span>}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Campagnes en Cours</h2>
            <div className="space-y-4">
              {[
                { name: 'Campagne Hiver 2024', progress: 75, amount: '30,000€', target: '40,000€' },
                { name: 'Aide aux Familles', progress: 45, amount: '9,000€', target: '20,000€' },
                { name: 'Éducation', progress: 90, amount: '18,000€', target: '20,000€' },
              ].map((campaign, index) => (
                <div key={index} className="pb-4 border-b border-gray-200 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{campaign.name}</h3>
                    <Badge variant="success">{campaign.progress}%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${campaign.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{campaign.amount} collectés</span>
                    <span>Objectif: {campaign.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <span className="text-2xl mb-2">➕</span>
              <span>Nouveau Donateur</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <span className="text-2xl mb-2">📊</span>
              <span>Nouvelle Campagne</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <span className="text-2xl mb-2">📧</span>
              <span>Envoyer Email</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <span className="text-2xl mb-2">📄</span>
              <span>Générer Rapport</span>
            </Button>
          </div>
        </div>
      </Card>
    </Container>
  );
}
