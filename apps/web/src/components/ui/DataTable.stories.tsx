import type { Meta, StoryObj } from '@storybook/react';
import DataTable from './DataTable';
import type { Column } from './DataTable';

const meta: Meta<typeof DataTable> = {
  title: 'UI/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', status: 'Active' },
];

const columns: Column<typeof sampleData[0]>[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'email', label: 'Email', sortable: true, filterable: true },
  { key: 'role', label: 'Role', sortable: true, filterable: true, filterType: 'select', filterOptions: [
    { label: 'Admin', value: 'Admin' },
    { label: 'User', value: 'User' },
    { label: 'Manager', value: 'Manager' },
  ]},
  { key: 'status', label: 'Status', sortable: true, filterable: true },
];

export const Default: Story = {
  args: {
    data: sampleData,
    columns,
  },
};

export const WithSearch: Story = {
  args: {
    data: sampleData,
    columns,
    searchable: true,
    searchPlaceholder: 'Search users...',
  },
};

export const WithPagination: Story = {
  args: {
    data: Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: ['Admin', 'User', 'Manager'][i % 3],
      status: ['Active', 'Inactive'][i % 2],
    })),
    columns,
    pageSize: 5,
  },
};

export const WithActions: Story = {
  args: {
    data: sampleData,
    columns,
    actions: (row) => [
      { label: 'Edit', onClick: () => console.log('Edit', row) },
      { label: 'Delete', onClick: () => console.log('Delete', row), variant: 'danger' },
    ],
  },
};

export const Loading: Story = {
  args: {
    data: [],
    columns,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns,
    emptyMessage: 'No users found',
  },
};

export const KeyboardNavigation: Story = {
  args: {
    data: sampleData,
    columns,
    onRowClick: (row) => console.log('Row clicked', row),
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'keyboard',
            enabled: true,
          },
        ],
      },
    },
  },
};

