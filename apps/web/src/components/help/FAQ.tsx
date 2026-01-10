/**
 * FAQ Component
 * 
 * Displays frequently asked questions in an accordion format.
 * 
 * @component
 */

'use client';

import { Accordion } from '@/components/ui';
import type { AccordionItem } from '@/components/ui';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface FAQProps {
  faqs?: FAQItem[];
  className?: string;
}

const defaultFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'Comment commencer avec ARISE ?',
    answer: 'Pour commencer avec ARISE, créez simplement un compte en cliquant sur "Commencer" ou "Inscription". Une fois inscrit, vous aurez accès à votre tableau de bord où vous pourrez commencer les évaluations MBTI, TKI, 360° et Bien-être. Suivez le guide de démarrage pour une meilleure compréhension de la plateforme.',
    category: 'Démarrage',
  },
  {
    id: '2',
    question: 'Qu\'est-ce que l\'évaluation MBTI ?',
    answer: 'L\'indicateur de type Myers-Briggs (MBTI) est une évaluation de personnalité qui vous aide à comprendre vos préférences naturelles et la façon dont vous interagissez avec le monde. Elle identifie votre type de personnalité parmi 16 types possibles, vous donnant des insights sur vos forces et votre style de leadership.',
    category: 'Évaluations',
  },
  {
    id: '3',
    question: 'Comment fonctionne l\'évaluation 360° ?',
    answer: 'L\'évaluation 360° vous permet d\'obtenir des retours complets de la part de vos collègues, managers et subordonnés directs. Vous pouvez inviter des évaluateurs qui vous connaissent bien dans différents contextes professionnels. Ces retours vous donneront une vision complète de votre impact en leadership sous tous les angles.',
    category: 'Évaluations',
  },
  {
    id: '4',
    question: 'Puis-je modifier mes réponses après avoir soumis une évaluation ?',
    answer: 'Une fois qu\'une évaluation est soumise, vous ne pouvez plus modifier vos réponses. Cependant, vous pouvez compléter une nouvelle évaluation à tout moment pour suivre votre évolution. Nous recommandons de refaire les évaluations tous les 6 à 12 mois pour voir votre progression.',
    category: 'Évaluations',
  },
  {
    id: '5',
    question: 'Comment accéder à mes rapports ?',
    answer: 'Une fois que vous avez complété une évaluation, vos rapports sont automatiquement générés et disponibles dans votre tableau de bord. Vous pouvez les consulter, télécharger en PDF, ou les partager avec votre coach ou votre manager.',
    category: 'Rapports',
  },
  {
    id: '6',
    question: 'Quelle est la différence entre les plans Individuel, Coach et Entreprise ?',
    answer: 'Le plan Individuel est parfait pour les leaders qui cherchent à développer leurs compétences personnelles. Le plan Coach permet de gérer plusieurs clients et d\'accéder aux rapports clients. Le plan Entreprise offre des évaluations d\'équipe, des insights à l\'échelle de l\'organisation et un support dédié.',
    category: 'Plans et Tarification',
  },
  {
    id: '7',
    question: 'Comment puis-je réinitialiser mon mot de passe ?',
    answer: 'Vous pouvez réinitialiser votre mot de passe en cliquant sur "Mot de passe oublié" sur la page de connexion. Vous recevrez un email avec les instructions pour réinitialiser votre mot de passe. Si vous ne recevez pas l\'email, vérifiez votre dossier spam.',
    category: 'Compte',
  },
  {
    id: '8',
    question: 'Puis-je annuler mon abonnement à tout moment ?',
    answer: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis la page des paramètres de facturation dans votre profil. Votre accès se poursuivra jusqu\'à la fin de votre période de facturation actuelle. Après l\'annulation, vous gardez l\'accès à vos rapports précédents.',
    category: 'Facturation',
  },
  {
    id: '9',
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer: 'Nous acceptons toutes les principales cartes de crédit et de débit. Les paiements sont traités de manière sécurisée via notre plateforme de paiement. Pour les plans Entreprise, nous proposons également des factures et des virements bancaires.',
    category: 'Facturation',
  },
  {
    id: '10',
    question: 'Comment puis-je contacter le support ?',
    answer: 'Vous pouvez contacter notre équipe de support en visitant la page "Contacter le Support" dans le centre d\'aide, ou en créant un ticket de support depuis votre tableau de bord. Notre équipe répond généralement dans les 24 heures ouvrables.',
    category: 'Support',
  },
  {
    id: '11',
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Absolument. Nous prenons la sécurité de vos données très au sérieux. Toutes les données sont cryptées en transit et au repos. Nous respectons les normes RGPD et ne partageons jamais vos informations avec des tiers sans votre consentement explicite.',
    category: 'Sécurité et Confidentialité',
  },
  {
    id: '12',
    question: 'Puis-je partager mes résultats avec mon coach ?',
    answer: 'Oui, vous pouvez partager vos rapports avec votre coach en lui donnant accès ou en téléchargeant vos rapports en PDF. Les coaches inscrits sur ARISE peuvent également avoir accès direct aux rapports de leurs clients s\'ils utilisent le plan Coach.',
    category: 'Partage et Collaboration',
  },
];

/**
 * FAQ Component
 * 
 * Displays FAQ items in an accordion format.
 */
export default function FAQ({
  faqs = defaultFAQs,
  className,
}: FAQProps) {
  const accordionItems: AccordionItem[] = faqs.map((faq) => ({
    id: faq.id,
    title: faq.question,
    content: faq.answer,
  }));

  return (
    <div className={className}>
      <Accordion items={accordionItems} />
    </div>
  );
}


