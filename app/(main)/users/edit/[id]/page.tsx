'use client';

import BackButton from '@/components/BackButton';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types/profiles';

const formSchema = z.object({
  first_name: z.string().min(1, { message: 'First name is required' }),
  last_name: z.string().min(1, { message: 'Last name is required' }),
  username: z.string().min(1, { message: 'Username is required' }),
  full_name: z.string(), // This will be generated, not shown in form
});

interface UserEditPageProps {
  params: {
    id: string;
  };
}

const UserEditPage = ({ params }: UserEditPageProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      full_name: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error || !data) {
        console.error('Error fetching profile:', error);
        toast({ title: 'Error', description: 'Could not fetch user data.' });
        setLoading(false);
        return;
      }

      form.reset(data as Profile);
      setLoading(false);
    };

    fetchProfile();
  }, [params.id, form, toast]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // Auto-generate full_name from first and last names
    const updatedValues = {
      ...values,
      full_name: `${values.first_name} ${values.last_name}`,
    };

    const { error } = await supabase
      .from('profiles')
      .update(updatedValues)
      .eq('id', params.id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: '✅ Profile updated successfully' });
      router.push('/users');
    }
  };

  if (loading) return <div>Loading user form...</div>;

  return (
    <>
      <BackButton text='Back To Users' link='/users' />
      <h3 className='text-2xl mb-4'>Edit User</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            name='first_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='last_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full'>
            Update Profile
          </Button>
        </form>
      </Form>
    </>
  );
};

export default UserEditPage;