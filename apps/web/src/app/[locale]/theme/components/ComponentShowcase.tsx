/**
 * Component Showcase Component
 * Displays UI components styled with the theme
 */

'use client';

import { Button, Card, Input, Badge, Alert } from '@/components/ui';
import { themeTokens } from '@/lib/theme';

export function ComponentShowcase() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <Card title="Default Card">Card content</Card>
          </Card>
          <Card title="Card with Title">Card with a title</Card>
          <Card title="Card with Footer" footer={<Button size="sm">Action</Button>}>
            Card with footer
          </Card>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Inputs</h3>
        <div className="space-y-4 max-w-md">
          <Input label="Text Input" placeholder="Enter text..." />
          <Input label="Email Input" type="email" placeholder="your@email.com" />
          <Input label="Password Input" type="password" placeholder="••••••••" />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Badges</h3>
        <div className="flex flex-wrap gap-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Alerts</h3>
        <div className="space-y-4">
          <Alert variant="info" title="Info Alert">
            This is an info alert
          </Alert>
          <Alert variant="success" title="Success Alert">
            This is a success alert
          </Alert>
          <Alert variant="warning" title="Warning Alert">
            This is a warning alert
          </Alert>
          <Alert variant="danger" title="Error Alert">
            This is an error alert
          </Alert>
        </div>
      </Card>
    </div>
  );
}
