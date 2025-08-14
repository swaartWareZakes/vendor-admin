'use client';

import { useRouter } from 'next/navigation';
import { useSupabaseSession } from '@/lib/hooks/useSupabaseSession';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useSupabaseSession();
  const router = useRouter();

  if (loading) {
    // A simple loading state for when the session is being checked
    return <div className='flex h-screen items-center justify-center'>Loading...</div>;
  }

  if (!session) {
    router.push('/auth');
    return null;
  }

  return (
    // The main container is a flex row that fills the screen height
    <div className='flex h-screen overflow-hidden bg-background'>
      {/* 1. Sidebar: Fixed width, never shrinks, and handles its own background */}
      <div className='hidden w-72 flex-shrink-0 bg-secondary md:block'>
        <Sidebar />
      </div>

      {/* 2. Content Area: A flex column that fills the remaining space */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        <Navbar />
        {/* The <main> tag is now the only scrollable element */}
        <main className='flex-1 overflow-y-auto p-5'>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;