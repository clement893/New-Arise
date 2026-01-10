import { Card } from '@/components/ui';

interface FAQItemProps {
  question: string;
  answer: string;
}

export default function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {question}
        </h3>
        <p className="text-gray-900 dark:text-gray-100">{answer}</p>
      </div>
    </Card>
  );
}

