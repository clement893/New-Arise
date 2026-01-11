/**
 * Assessment Icons Mapping
 * Maps assessment pillars/capabilities to Lucide React icons
 */

import {
  Heart,
  Dumbbell,
  Apple,
  Moon,
  Users,
  Brain,
  MessageSquare,
  TrendingUp,
  Puzzle,
  Shield,
  Target,
  Zap,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// Wellness Pillars Icons
export const wellnessPillarIcons: Record<string, LucideIcon> = {
  'Avoidance of Risky Substances': Shield,
  'Movement': Dumbbell,
  'Nutrition': Apple,
  'Sleep': Moon,
  'Social Connection': Users,
  'Stress Management': Brain,
};

// 360 Feedback Capabilities Icons
export const feedback360CapabilityIcons: Record<string, LucideIcon> = {
  'change_management': TrendingUp,
  'communication': MessageSquare,
  'leadership_style': Target,
  'problem_solving_and_decision_making': Puzzle,
  'stress_management': Brain,
  'team_culture': Users,
};

// TKI Modes Icons (if needed)
export const tkiModeIcons: Record<string, LucideIcon> = {
  'competing': Zap,
  'collaborating': Users,
  'avoiding': Shield,
  'accommodating': Heart,
  'compromising': Target,
};

// Default icon
export const DefaultIcon = Heart;
