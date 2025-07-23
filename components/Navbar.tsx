'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import logo from '../img/logo.png';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ThemeToggler from '@/components/ThemeToggler';
import { useSupabaseSession } from '@/lib/hooks/useSupabaseSession';
import { supabase } from '@/lib/supabaseClient';
import {
  LayoutDashboard,
  Folders,
  Store
} from 'lucide-react';

const Navbar = () => {
  const { session } = useSupabaseSession();
  const router = useRouter();

  const user = session?.user;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <div className='bg-primary dark:bg-slate-700 text-white py-2 px-5 flex justify-between items-center'>
      <Link href='/'>
        <Image src={logo} alt='iNtloko' width={40} />
      </Link>

      <div className='flex items-center gap-4'>
        <ThemeToggler />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className='focus:outline-none'>
              <Avatar>
                <AvatarImage src='https://github.com/shadcn.png' alt={user.email || 'User'} />
                <AvatarFallback className='text-black'>
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                {user.user_metadata?.name || 'Admin User'}
              </DropdownMenuLabel>
              <DropdownMenuLabel className='text-xs text-muted-foreground'>
                {user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href='/profile'>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className='md:hidden'>
                <Link href='/'>
                  <LayoutDashboard className='mr-2 h-4 w-4' /> Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className='md:hidden'>
                <Link href='/vendors'>
                  <Store className='mr-2 h-4 w-4' /> Vendors
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className='md:hidden'>
                <Link href='#'>
                  <Folders className='mr-2 h-4 w-4' /> Categories
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default Navbar;
