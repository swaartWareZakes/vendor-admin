'use client';

import { useRouter } from 'next/navigation';
import { useSupabaseSession } from '@/lib/hooks/useSupabaseSession';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useSupabaseSession();
  const router = useRouter();

  if (loading) return null;

  if (!session) {
    router.push('/auth');
    return null;
  }

  return (
    <>
      <Navbar />
      <div className='flex'>
        <div className='hidden md:block h-[100vh] w-[300px]'>
          <Sidebar />
        </div>
        <div className='p-5 w-full md:max-w-[1140px]'>{children}</div>
      </div>
    </>
  );
};

export default MainLayout;