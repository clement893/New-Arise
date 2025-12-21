# Bibliothèque de Composants UI ERP

Bibliothèque complète de composants UI pour applications ERP.

## 📦 Composants Disponibles

### Composants de Base

#### Button
Bouton avec plusieurs variantes et tailles.

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'`
- `size`: `'sm' | 'md' | 'lg'`
- `disabled`: `boolean`
- `loading`: `boolean`

#### Input
Champ de saisie avec support d'icônes.

```tsx
import { Input } from '@/components/ui';

<Input
  placeholder="Enter text"
  leftIcon={<SearchIcon />}
  rightIcon={<ClearIcon />}
  error="Error message"
/>
```

#### Checkbox
Case à cocher avec support d'état indéterminé.

```tsx
import { Checkbox } from '@/components/ui';

<Checkbox
  label="Accept terms"
  checked={checked}
  indeterminate={indeterminate}
  onChange={(checked) => setChecked(checked)}
/>
```

#### Badge
Badge pour afficher des statuts ou labels.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Active</Badge>
<Badge variant="error">Inactive</Badge>
```

**Variants:** `'default' | 'success' | 'warning' | 'error' | 'info'`

### Composants de Layout

#### Card
Carte pour afficher du contenu groupé.

```tsx
import { Card } from '@/components/ui';

<Card
  title="Card Title"
  subtitle="Card subtitle"
  footer={<Button>Action</Button>}
>
  Card content
</Card>
```

#### Tabs
Navigation par onglets.

```tsx
import { Tabs } from '@/components/ui';

<Tabs
  tabs={[
    { id: '1', label: 'Tab 1', content: <div>Content 1</div> },
    { id: '2', label: 'Tab 2', content: <div>Content 2</div> },
  ]}
  variant="pills"
/>
```

**Variants:** `'default' | 'pills' | 'underline'`

#### Accordion
Contenu repliable.

```tsx
import { Accordion } from '@/components/ui';

<Accordion
  items={[
    {
      id: '1',
      title: 'Section 1',
      content: <div>Content</div>,
      defaultOpen: true,
    },
  ]}
  allowMultiple={false}
/>
```

### Composants de Données

#### DataTable
Tableau de données avec recherche, tri et pagination.

```tsx
import { DataTable } from '@/components/ui';

<DataTable
  data={users}
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', filterable: true },
  ]}
  pageSize={10}
  searchable
  onRowClick={(row) => console.log(row)}
/>
```

#### DataTableEnhanced
Version améliorée avec sélection multiple et actions en masse.

```tsx
import { DataTableEnhanced } from '@/components/ui';

<DataTableEnhanced
  data={users}
  columns={columns}
  selectable
  bulkActions={[
    {
      label: 'Delete',
      onClick: (selected) => deleteUsers(selected),
      variant: 'danger',
      requireConfirmation: true,
    },
  ]}
  exportOptions={[
    { label: 'Export CSV', format: 'csv', onClick: exportCSV },
  ]}
  onSelectionChange={(selected) => console.log(selected)}
/>
```

### Composants Overlay

#### Modal
Modal dialog complet.

```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="lg"
  footer={<Button onClick={handleSave}>Save</Button>}
>
  Modal content
</Modal>
```

**Sizes:** `'sm' | 'md' | 'lg' | 'xl' | 'full'`

#### ConfirmModal
Modal de confirmation pré-configuré.

```tsx
import { ConfirmModal } from '@/components/ui';

<ConfirmModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleConfirm}
  message="Are you sure?"
  variant="danger"
/>
```

#### Tooltip
Info-bulle contextuelle.

```tsx
import { Tooltip } from '@/components/ui';

<Tooltip content="Tooltip text" position="top">
  <Button>Hover me</Button>
</Tooltip>
```

**Positions:** `'top' | 'bottom' | 'left' | 'right'`

### Composants de Formulaire

#### Form
Formulaire complet avec validation.

```tsx
import { Form } from '@/components/ui';

<Form
  fields={[
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      validation: (value) => {
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(String(value))) return 'Invalid email';
        return null;
      },
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
  ]}
  onSubmit={handleSubmit}
  initialValues={{ email: 'user@example.com' }}
/>
```

#### FormField
Champ de formulaire avec contrôle total.

```tsx
import { FormField } from '@/components/ui';

<FormField
  label="Email"
  name="email"
  required
  error={errors.email}
  helpText="Enter your email address"
>
  <Input type="email" />
</FormField>
```

### Composants de Feedback

#### Alert
Alertes et notifications.

```tsx
import { Alert } from '@/components/ui';

<Alert variant="success" title="Success" onClose={() => {}}>
  Operation completed successfully
</Alert>
```

**Variants:** `'info' | 'success' | 'warning' | 'error'`

### Composants Utilitaires

#### Avatar
Avatar utilisateur avec fallback.

```tsx
import { Avatar } from '@/components/ui';

<Avatar
  src="/avatar.jpg"
  alt="User"
  fallback="JD"
  size="lg"
/>
```

#### Pagination
Pagination pour les listes.

```tsx
import { Pagination } from '@/components/ui';

<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => setPage(page)}
/>
```

## 🎨 Thème et Personnalisation

Tous les composants supportent le mode sombre automatiquement via les classes Tailwind `dark:`.

### Personnalisation des Couleurs

Les composants utilisent des variantes de couleur standardisées :
- **Primary**: Bleu (`blue-600`)
- **Success**: Vert (`green-600`)
- **Warning**: Jaune (`yellow-600`)
- **Error**: Rouge (`red-600`)
- **Info**: Bleu clair (`blue-500`)

## 📚 Exemples d'Utilisation

### Formulaire Complet avec Validation

```tsx
'use client';

import { useState } from 'react';
import { Form, Modal, Alert } from '@/components/ui';

export function UserForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data) => {
    try {
      await createUser(data);
      setSuccess(true);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Add User</button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add User"
      >
        <Form
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            {
              name: 'role',
              label: 'Role',
              type: 'select',
              options: [
                { label: 'Admin', value: 'admin' },
                { label: 'User', value: 'user' },
              ],
            },
          ]}
          onSubmit={handleSubmit}
        />
      </Modal>

      {success && (
        <Alert variant="success" onClose={() => setSuccess(false)}>
          User created successfully
        </Alert>
      )}
    </>
  );
}
```

### Tableau avec Actions en Masse

```tsx
'use client';

import { DataTableEnhanced } from '@/components/ui';

export function UsersTable({ users }) {
  const handleBulkDelete = async (selected) => {
    await Promise.all(selected.map(user => deleteUser(user.id)));
  };

  const handleExport = (data) => {
    // Export logic
    console.log('Exporting', data);
  };

  return (
    <DataTableEnhanced
      data={users}
      columns={[
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', filterable: true },
        { key: 'role', label: 'Role' },
      ]}
      selectable
      bulkActions={[
        {
          label: 'Delete Selected',
          onClick: handleBulkDelete,
          variant: 'danger',
          requireConfirmation: true,
          confirmationMessage: 'Are you sure you want to delete selected users?',
        },
      ]}
      exportOptions={[
        { label: 'Export CSV', format: 'csv', onClick: handleExport },
        { label: 'Export Excel', format: 'xlsx', onClick: handleExport },
      ]}
    />
  );
}
```

## 🔧 Types TypeScript

Tous les composants sont entièrement typés avec TypeScript. Les types sont exportés depuis `@/components/ui` :

```typescript
import type {
  Column,
  DataTableProps,
  ModalProps,
  FormProps,
  AlertVariant,
} from '@/components/ui';
```

## 📖 Documentation Complète

Pour plus de détails sur chaque composant, consultez les fichiers source dans `src/components/ui/`.

