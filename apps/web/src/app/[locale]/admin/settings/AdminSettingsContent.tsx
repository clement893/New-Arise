'use client';

import { useState, useEffect } from 'react';
import { PageHeader, PageContainer, Section } from '@/components/layout';
import { Button, Card, Alert, Input, Switch } from '@/components/ui';
import { getErrorMessage } from '@/lib/errors';

export default function AdminSettingsContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    registration_enabled: true,
    email_verification_required: true,
    api_rate_limit: 100,
    session_timeout: 3600,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // TODO: Load actual system settings from API when endpoint is available
    // For now, use default values
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // TODO: Implement API endpoint for system settings
      // const response = await fetch(`${getApiUrl()}/api/v1/admin/settings`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(settings),
      // });

      // Simulate save for now
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Error saving settings'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="System Settings" 
        description="General system configuration"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Administration', href: '/admin' },
          { label: 'Settings' }
        ]} 
      />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-4">
          Settings updated successfully
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Section title="General" className="mt-6">
          <Card className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground">
                  Maintenance Mode
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Enable maintenance mode to restrict system access
                </p>
              </div>
              <Switch
                checked={settings.maintenance_mode}
                onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground">
                  Registration Enabled
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Allow new users to register
                </p>
              </div>
              <Switch
                checked={settings.registration_enabled}
                onChange={(e) => setSettings({ ...settings, registration_enabled: e.target.checked })}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground">
                  Email Verification Required
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Users must verify their email to activate their account
                </p>
              </div>
              <Switch
                checked={settings.email_verification_required}
                onChange={(e) => setSettings({ ...settings, email_verification_required: e.target.checked })}
              />
            </div>
          </Card>
        </Section>

        <Section title="Security" className="mt-6">
          <Card className="p-4 sm:p-6 space-y-6">
            <Input
              label="API Rate Limit (requests/minute)"
              type="number"
              value={settings.api_rate_limit}
              onChange={(e) => setSettings({ ...settings, api_rate_limit: parseInt(e.target.value) || 100 })}
              min={1}
              max={10000}
            />

            <Input
              label="Session Timeout (seconds)"
              type="number"
              value={settings.session_timeout}
              onChange={(e) => setSettings({ ...settings, session_timeout: parseInt(e.target.value) || 3600 })}
              min={300}
              max={86400}
            />
          </Card>
        </Section>

        <div className="mt-6 flex justify-end">
          <Button type="submit" variant="primary" loading={loading} className="w-full sm:w-auto text-sm sm:text-base">
            Save Settings
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

