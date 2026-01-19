import { create } from 'zustand';

export interface SelectedPlan {
  id: number;
  name: string;
  description?: string;
  amount?: number;
  currency: string;
  interval: string;
  interval_count?: number;
}

export interface RegistrationState {
  step: number;
  role: 'individual' | 'coach' | 'business' | null;
  planId: string | null;
  selectedPlan: SelectedPlan | null;
  userInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    userId?: string | number;
  };
  profileInfo: {
    companyName?: string;
    jobTitle?: string;
    industry?: string;
  };
  setStep: (step: number) => void;
  setRole: (role: 'individual' | 'coach' | 'business') => void;
  setPlanId: (planId: string) => void;
  setSelectedPlan: (plan: SelectedPlan | null) => void;
  setUserInfo: (userInfo: Partial<RegistrationState['userInfo']>) => void;
  setProfileInfo: (profileInfo: Partial<RegistrationState['profileInfo']>) => void;
  reset: () => void;
}

const initialState = {
  step: 1,
  role: null,
  planId: null,
  selectedPlan: null,
  userInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    userId: undefined,
  },
  profileInfo: {},
};

export const useRegistrationStore = create<RegistrationState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setRole: (role) => set({ role }),
  setPlanId: (planId) => set({ planId }),
  setSelectedPlan: (selectedPlan) => set({ selectedPlan }),
  setUserInfo: (userInfo) =>
    set((state) => ({
      userInfo: { ...state.userInfo, ...userInfo },
    })),
  setProfileInfo: (profileInfo) =>
    set((state) => ({
      profileInfo: { ...state.profileInfo, ...profileInfo },
    })),
  reset: () => set(initialState),
}));
