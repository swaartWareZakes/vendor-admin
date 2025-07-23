'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { CategoryModal } from './CategoryModal';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.array(z.string()).nonempty('Select at least one category'),
  rating: z.coerce.number().min(0).max(5),
  tags: z.string().optional(),
  location: z.string().optional(),
  price_range: z.string().optional(),
  image: z.any().optional(),
});

export default function AddVendorModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [location, setLocation] = useState<{
    type: 'Point';
    coordinates: [number, number];
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      category: [],
      rating: 0,
      tags: '',
      location: '',
      price_range: '',
      image: undefined,
    },
  });

  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('intloko')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('intloko')
      .getPublicUrl(data.path);
    return publicUrlData?.publicUrl || null;
  };

  const handleUseCurrentLocation = async () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const coords: [number, number] = [
        pos.coords.longitude,
        pos.coords.latitude,
      ];
      setLocation({ type: 'Point', coordinates: coords });

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords[1]}&lon=${coords[0]}&format=json`
      );
      const data = await res.json();
      setResolvedAddress(data.display_name || '');
      form.setValue('location', data.display_name || '');
    });
  };

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      let imageUrl = null;
      if (values.image && values.image.length > 0) {
        imageUrl = await uploadImage(values.image[0]);
      }

      const vendor = {
        title: values.title,
        category: values.category,
        rating: values.rating,
        tags: values.tags?.split(',').map((t) => t.trim()),
        location: location
          ? `SRID=4326;POINT(${location.coordinates[0]} ${location.coordinates[1]})`
          : null,
        price_range: values.price_range,
        image_url: imageUrl,
      };

      const { error } = await supabase.from('vendors').insert(vendor);

      if (error) {
        toast({
          title: '❌ Error adding vendor',
          description: error.message,
        });
      } else {
        toast({ title: '✅ Vendor added successfully' });
        form.reset();
        onClose();
        onSuccess();
      }
    } catch (err: any) {
      toast({ title: '❌ Upload error', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              name='title'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder='Vendor name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='category'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <div>
                      <Button
                        type='button'
                        variant='outline'
                        className='w-full justify-between'
                        onClick={() => setCategoryModalOpen(true)}
                      >
                        {field.value.length > 0
                          ? field.value.join(', ')
                          : 'Select categories'}
                      </Button>
                      <CategoryModal
                        open={categoryModalOpen}
                        onClose={() => setCategoryModalOpen(false)}
                        selected={field.value}
                        onSave={(selected) => field.onChange(selected)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='rating'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      max={5}
                      step='0.1'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='tags'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. special chillies, homemade' {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name='price_range'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Range</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. R50 - R120' {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name='image'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      type='file'
                      accept='image/*'
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Address</FormLabel>
              <Button
                type='button'
                onClick={handleUseCurrentLocation}
              >
                📍 Use My Location
              </Button>
              {resolvedAddress && (
                <p className='text-sm text-green-600 mt-1'>
                  Detected: {resolvedAddress}
                </p>
              )}
            </FormItem>

            <Button type='submit' disabled={loading} className='w-full'>
              {loading ? 'Saving...' : 'Save Vendor'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
