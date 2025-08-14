'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Vendor } from '@/types/vendors';
import { Profile } from '@/types/profiles';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { Folder, Star, Store, Users } from 'lucide-react';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import RecentVendors from '@/components/dashboard/RecentVendors';

export default function Home() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [vendorsResponse, profilesResponse] = await Promise.all([
        supabase
          .from('vendors')
          .select('*')
          .order('inserted_at', { ascending: false }),
        supabase.from('profiles').select('*'),
      ]);

      if (vendorsResponse.error) {
        console.error('❌ Supabase vendors fetch error:', vendorsResponse.error);
      } else {
        setVendors(vendorsResponse.data as Vendor[]);
      }

      if (profilesResponse.error) {
        console.error('❌ Supabase profiles fetch error:', profilesResponse.error);
      } else {
        setProfiles(profilesResponse.data as Profile[]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const averageRating =
    vendors.length > 0
      ? parseFloat(
          (
            vendors.reduce((sum, v) => sum + (v.rating || 0), 0) /
            vendors.length
          ).toFixed(1)
        )
      : 0;

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <>
      {/* Top Row Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-5'>
        <DashboardCard
          title='Total Vendors'
          count={vendors.length}
          icon={<Store className='text-primary' size={28} />}
        />
        <DashboardCard
          title='Total Users'
          count={profiles.length}
          icon={<Users className='text-primary' size={28} />}
        />
        <DashboardCard
          title='Average Rating'
          count={averageRating}
          icon={<Star className='text-primary' size={28} />}
        />
        <DashboardCard
          title='Categories'
          count={new Set(vendors.map((v) => v.category)).size}
          icon={<Folder className='text-primary' size={28} />}
        />
      </div>

      {/* Main Content Area: Now a single column with space between items */}
      <div className='space-y-5'>
        <AnalyticsChart vendors={vendors} profiles={profiles} />
        <RecentVendors vendors={vendors} />
      </div>
    </>
  );
}