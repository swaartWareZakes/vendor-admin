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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  rating: z.coerce.number().min(0).max(5),
  price_range: z.string().min(1, { message: 'Price range is required' }),
});

interface VendorEditPageProps {
  params: {
    id: string;
  };
}

const VendorEditPage = ({ params }: VendorEditPageProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      category: '',
      rating: 0,
      price_range: '',
    },
  });

  useEffect(() => {
    const fetchVendor = async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error fetching vendor:', error);
        return;
      }

      form.reset({
        title: data.title,
        category: data.category,
        rating: data.rating,
        price_range: data.price_range,
      });
      setLoading(false);
    };

    fetchVendor();
  }, [params.id, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const { error } = await supabase
      .from('vendors')
      .update(values)
      .eq('id', params.id);

    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      toast({ title: 'Vendor updated successfully' });
      router.push('/vendors');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <BackButton text='Back To Vendors' link='/vendors' />
      <h3 className='text-2xl mb-4'>Edit Vendor</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Title
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Category
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='rating'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Rating
                </FormLabel>
                <FormControl>
                  <Input type='number' step='0.1' min='0' max='5' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='price_range'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Price Range
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className='w-full'>Update Vendor</Button>
        </form>
      </Form>
    </>
  );
};

export default VendorEditPage;