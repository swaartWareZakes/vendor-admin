'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import BackButton from '@/components/BackButton';
import AddVendorModal from '@/components/vendors/AddVendorModal';
import VendorsTable from '@/components/vendors/VendorsTable';
import VendorsPagination from '@/components/vendors/VendorsPagination';

export interface Vendor {
  id: string;
  title: string;
  category: string;
  rating: number;
  tags: string[];
  location: string;
  price_range: string;
  visitors: number;
  image_url: string;
  inserted_at: string;
  user_id: string;
}

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('inserted_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching vendors:', error.message, error.details);
    } else {
      setVendors(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <>
      <div className='flex justify-between items-center mb-4'>
        <BackButton text='Go Back' link='/' />
        <Button onClick={() => setModalOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Add Vendor
        </Button>
      </div>

      <AddVendorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchVendors}
      />

      {loading ? (
        <p>Loading vendors...</p>
      ) : (
        <>
          {vendors.length === 0 ? (
            <p className='text-gray-500'>No vendors to show.</p>
          ) : (
            <>
              <VendorsTable vendors={vendors} onDeleteSuccess={fetchVendors}  />
              <VendorsPagination />
            </>
          )}
        </>
      )}
    </>
  );
};

export default VendorsPage;
