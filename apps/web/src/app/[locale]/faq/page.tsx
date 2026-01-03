'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FAQRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/help/faq');
  }, [router]);
  
  return null;
}
