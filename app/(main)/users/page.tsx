'use client';

import { useEffect, useState } from 'react';
import BackButton from '@/components/BackButton';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types/profiles';
import UsersTable from '@/components/users/UsersTable';

const UsersPage = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error.message);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return (
    <>
      <BackButton text='Go Back' link='/' />
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <UsersTable profiles={profiles} onDeleteSuccess={fetchProfiles} />
      )}
    </>
  );
};

export default UsersPage;