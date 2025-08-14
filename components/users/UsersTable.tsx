'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import Link from 'next/link';
import { Profile } from '@/types/profiles';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UsersTableProps {
  profiles: Profile[];
  onDeleteSuccess: () => void;
}

const UsersTable = ({ profiles, onDeleteSuccess }: UsersTableProps) => {
  const handleDelete = async (profileId: string) => {
    // Note: This only deletes the profile record, not the auth.users entry.
    // A database function is recommended for a full user deletion.
    if (!confirm('Are you sure you want to delete this user profile?')) return;

    const { error } = await supabase.from('profiles').delete().eq('id', profileId);

    if (error) {
      toast({
        title: '❌ Failed to delete user',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: '✅ User deleted successfully' });
      onDeleteSuccess();
    }
  };

  return (
    <div className='mt-10'>
      <h3 className='text-2xl mb-4 font-semibold'>Users</h3>
      <Table>
        <TableCaption>A list of registered users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Username</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell>
                <div className='flex items-center gap-3'>
                  <Avatar>
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    <AvatarFallback>
                      {profile.first_name?.charAt(0)}
                      {profile.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-medium'>{profile.full_name}</p>
                    <p className='text-sm text-muted-foreground'>{profile.id}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{profile.username}</TableCell>
              <TableCell className='flex gap-2 justify-end'>
                <Link href={`/users/edit/${profile.id}`}>
                  <Button size='sm'>Edit</Button>
                </Link>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => handleDelete(profile.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;