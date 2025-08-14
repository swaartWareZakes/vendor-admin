'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, Users2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import logo from '../img/logo.png';

const links = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Vendors',
    href: '/vendors',
    icon: Store,
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users2,
  },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    // ✅ REMOVED: `bg-secondary` is no longer needed here
    <div className='flex h-full flex-col space-y-4 p-3'>
      <Link href='/' className='mb-4 flex items-center gap-2 px-2'>
        <Image src={logo} alt='iNtloko Logo' width={40} height={40} />
        <h1 className='text-xl font-bold'>iNtloko</h1>
      </Link>
      <div className='flex-1'>
        <ul className='space-y-1'>
          {links.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  {
                    'bg-primary/10 text-primary': pathname === link.href,
                  }
                )}
              >
                <link.icon className='h-4 w-4' />
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;