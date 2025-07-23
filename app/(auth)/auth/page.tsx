'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseSession } from '@/lib/hooks/useSupabaseSession';
import AuthTabs from '@/components/auth/AuthTabs';

const AuthPage = () => {
  const { session, loading } = useSupabaseSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) {
      router.push('/');
    }
  }, [loading, session]);

  if (loading || session) return null;

  return <AuthTabs />;
};

export default AuthPage;