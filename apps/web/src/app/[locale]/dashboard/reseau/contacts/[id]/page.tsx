'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { reseauContactsAPI } from '@/lib/api/reseau-contacts';
import type { Contact } from '@/lib/api/reseau-contacts';
import { handleApiError } from '@/lib/errors/api';
import { useToast } from '@/components/ui';
import { PageHeader, PageContainer } from '@/components/layout';
import ContactDetail from '@/components/reseau/ContactDetail';
import { Loading, Alert } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_deleting, setDeleting] = useState(false);

  const contactId = params?.id ? parseInt(String(params.id)) : null;

  useEffect(() => {
    if (!contactId) {
      setError('Invalid contact ID');
      setLoading(false);
      return;
    }

    loadContact();
  }, [contactId]);

  const loadContact = async () => {
    if (!contactId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await reseauContactsAPI.get(contactId);
      setContact(data);
    } catch (err) {
      const appError = handleApiError(err);
      setError(appError.message || 'Error loading contact');
      showToast({
        message: appError.message || 'Error loading contact',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (contact) {
      const locale = params?.locale as string || 'en';
      router.push(`/${locale}/dashboard/reseau/contacts/${contact.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!contact || !confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      setDeleting(true);
      await reseauContactsAPI.delete(contact.id);
      showToast({
        message: 'Contact deleted successfully',
        type: 'success',
      });
      const locale = params?.locale as string || 'en';
      router.push(`/${locale}/dashboard/reseau/contacts`);
    } catch (err) {
      const appError = handleApiError(err);
      setError(appError.message || 'Error deleting');
      showToast({
        message: appError.message || 'Error deleting',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="py-12 text-center">
          <Loading />
        </div>
      </PageContainer>
    );
  }

  if (error && !contact) {
    return (
      <PageContainer>
        <PageHeader
          title="Erreur"
          breadcrumbs={[
            { label: 'Dashboard', href: `/${params?.locale || 'fr'}/dashboard` },
            { label: 'Network Module', href: `/${params?.locale || 'en'}/dashboard/reseau` },
            { label: 'Contacts', href: `/${params?.locale || 'en'}/dashboard/reseau/contacts` },
            { label: 'Details' },
          ]}
        />
        <Alert variant="error">{typeof error === 'string' ? error : String(error || 'An error occurred')}</Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => {
            const locale = params?.locale as string || 'en';
            router.push(`/${locale}/dashboard/reseau/contacts`);
          }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to contacts
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (!contact) {
    return (
      <PageContainer>
        <PageHeader
          title="Contact not found"
          breadcrumbs={[
            { label: 'Dashboard', href: `/${params?.locale || 'en'}/dashboard` },
            { label: 'Network Module', href: `/${params?.locale || 'en'}/dashboard/reseau` },
            { label: 'Contacts', href: `/${params?.locale || 'en'}/dashboard/reseau/contacts` },
            { label: 'Details' },
          ]}
        />
        <Alert variant="error">The requested contact does not exist.</Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => {
            const locale = params?.locale as string || 'en';
            router.push(`/${locale}/dashboard/reseau/contacts`);
          }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to contacts
          </Button>
        </div>
      </PageContainer>
    );
  }

  const handleBack = () => {
    const locale = params?.locale as string || 'en';
    router.push(`/${locale}/dashboard/reseau/contacts`);
  };

  return (
    <PageContainer>
      <PageHeader
        title={`${contact.first_name} ${contact.last_name}`}
        breadcrumbs={[
          { label: 'Dashboard', href: `/${params?.locale || 'en'}/dashboard` },
          { label: 'Network Module', href: `/${params?.locale || 'en'}/dashboard/reseau` },
          { label: 'Contacts', href: `/${params?.locale || 'en'}/dashboard/reseau/contacts` },
          { label: `${contact.first_name} ${contact.last_name}` },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to list
          </Button>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert variant="error">{typeof error === 'string' ? error : String(error || 'An error occurred')}</Alert>
        </div>
      )}

      <div className="mt-6">
        <ContactDetail
          contact={contact}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </PageContainer>
  );
}
