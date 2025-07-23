'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Vendor } from '@/types/vendors';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { Folder, MapPin, Star, Store } from 'lucide-react';

export default function Home() {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    const fetchVendors = async () => {
      const { data, error } = await supabase.from('vendors').select('*');
      if (error) {
        console.error('❌ Supabase fetch error:', error);
      } else {
        setVendors(data as Vendor[]);
      }
    };

    fetchVendors();
  }, []);

  return (
    <div>
      <div className='flex flex-col md:flex-row justify-between gap-5 mb-5'>
        <DashboardCard
          title='Vendors'
          count={vendors.length}
          icon={<Store className='text-slate-500' size={72} />}
        />
        <DashboardCard
          title='Categories'
          count={new Set(vendors.map((v) => v.category)).size}
          icon={<Folder className='text-slate-500' size={72} />}
        />
        <DashboardCard
          title='Avg Rating'
          count={
            vendors.length
              ? Number(
                  (
                    vendors.reduce((sum, v) => sum + (v.rating || 0), 0) /
                    vendors.length
                  ).toFixed(1)
                )
              : 0
          }
          icon={<Star className='text-slate-500' size={72} />}
        />
        <DashboardCard
          title='Tagged'
          count={vendors.filter((v) => v.tags?.length).length}
          icon={<MapPin className='text-slate-500' size={72} />}
        />
      </div>

      <h2 className='text-xl font-bold mb-2'>Vendors Preview</h2>
      <ul className='space-y-2'>
        {vendors.map((vendor) => (
          <li
            key={vendor.id}
            className='border rounded p-4 bg-white dark:bg-slate-800'
          >
            <div className='font-bold'>{vendor.title}</div>
            <div className='text-sm text-gray-500'>
              Category: {vendor.category} • Rating: {vendor.rating}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}