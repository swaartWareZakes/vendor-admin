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
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { CategoryModal } from './CategoryModal';
import { Loader } from '@googlemaps/js-api-loader';
import debounce from 'lodash.debounce';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.array(z.string()).nonempty('Select at least one category'),
  rating: z.coerce.number().min(0).max(5),
  tags: z.string().optional(),
  location: z.string().optional(),
  price_range: z.string().optional(),
  image_food: z.any().optional(),
  image_outside: z.any().optional(),
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
  const [location, setLocation] = useState<{ type: 'Point'; coordinates: [number, number] } | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [useTypedAddress, setUseTypedAddress] = useState(true);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      category: [],
      rating: 0,
      tags: '',
      location: '',
      price_range: '',
      image_food: undefined,
      image_outside: undefined,
    },
  });

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_Maps_API_KEY as string, 
      version: 'weekly',
      libraries: ['places'],
    });

    loader.load().then(() => {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      geocoder.current = new google.maps.Geocoder();
    }).catch(e => {
      console.error('Failed to load Google Maps API', e);
      toast({
        title: '❌ Could not load map services',
        description: 'Please check your API key and internet connection.',
        variant: 'destructive',
      });
    });
  }, []);

  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('intloko').upload(fileName, file, {
      contentType: file.type,
      upsert: true,
    });
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage.from('intloko').getPublicUrl(data.path);
    return publicUrlData?.publicUrl || null;
  };

  const fetchSuggestions = useCallback(
    debounce((query: string) => {
      if (!autocompleteService.current || query.length < 3) {
        setSuggestions([]);
        return;
      }
      autocompleteService.current.getPlacePredictions(
        { input: query, componentRestrictions: { country: 'za' } },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
          }
        }
      );
    }, 300),
    []
  );

  const handleSuggestionClick = (placeId: string) => {
    if (!geocoder.current) return;
    geocoder.current.geocode({ placeId: placeId }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const geo = results[0].geometry.location;
        setLocation({ type: 'Point', coordinates: [geo.lng(), geo.lat()] });
        form.setValue('location', results[0].formatted_address);
        setResolvedAddress(results[0].formatted_address);
        setShowSuggestions(false);
        setSuggestions([]);
      } else {
        toast({
          title: '❌ Could not get location details',
          description: 'Please try another address.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleUseCurrentLocation = async () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
      if (!geocoder.current) {
        toast({ title: '❌ Geocoder not ready', description: 'Please wait a moment and try again.' });
        return;
      }
      geocoder.current.geocode({ location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setLocation({ type: 'Point', coordinates: coords });
          setResolvedAddress(results[0].formatted_address);
          form.setValue('location', results[0].formatted_address);
        }
      });
    });
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      // ✅ MODIFIED: Upload images in parallel and get their individual URLs
      const foodUploadPromise = values.image_food?.[0]
        ? uploadImage(values.image_food[0])
        : Promise.resolve(null);
      
      const outsideUploadPromise = values.image_outside?.[0]
        ? uploadImage(values.image_outside[0])
        : Promise.resolve(null);

      const [foodUrl, outsideUrl] = await Promise.all([
        foodUploadPromise,
        outsideUploadPromise,
      ]);

      if (!location) {
        toast({ title: '❌ Location missing', description: 'Please select a valid location.' });
        setLoading(false);
        return;
      }

      // ✅ MODIFIED: Create the vendor object with the new separate image URL columns
      const vendor = {
        title: values.title,
        category: values.category,
        rating: values.rating,
        tags: values.tags?.split(',').map((t) => t.trim()),
        location: `SRID=4326;POINT(${location.coordinates[0]} ${location.coordinates[1]})`,
        price_range: values.price_range,
        image_url_food: foodUrl,
        image_url_outside: outsideUrl,
      };

      const { error } = await supabase.from('vendors').insert(vendor);
      if (error) {
        toast({ title: '❌ Error adding vendor', description: error.message });
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField name='title' control={form.control} render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder='Vendor name' {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField name='category' control={form.control} render={({ field }) => ( <FormItem><FormLabel>Category</FormLabel><FormControl><div><Button type='button' variant='outline' className='w-full justify-between' onClick={() => setCategoryModalOpen(true)}>{field.value.length > 0 ? field.value.join(', ') : 'Select categories'}</Button><CategoryModal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} selected={field.value} onSave={(selected) => field.onChange(selected)}/></div></FormControl><FormMessage /></FormItem>)} />
            <FormField name='rating' control={form.control} render={({ field }) => ( <FormItem><FormLabel>Rating</FormLabel><FormControl><Input type='number' min={0} max={5} step='0.1' {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField name='tags' control={form.control} render={({ field }) => ( <FormItem><FormLabel>Tags (comma-separated)</FormLabel><FormControl><Input placeholder='e.g. special chillies, homemade' {...field} /></FormControl></FormItem>)} />
            <FormField name='price_range' control={form.control} render={({ field }) => ( <FormItem><FormLabel>Price Range</FormLabel><FormControl><Input placeholder='e.g. R50 - R120' {...field} /></FormControl></FormItem>)} />
            
            <FormField name='image_food' control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Food Image</FormLabel>
                <FormControl><Input type='file' accept='image/*' onChange={(e) => field.onChange(e.target.files)}/></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name='image_outside' control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Outside Image (of the location)</FormLabel>
                <FormControl><Input type='file' accept='image/*' onChange={(e) => field.onChange(e.target.files)}/></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormItem>
              <FormLabel>Location</FormLabel>
              <div className='flex gap-2'>
                <Button type='button' variant={!useTypedAddress ? 'default' : 'outline'} onClick={() => setUseTypedAddress(false)}>📍 Use My Location</Button>
                <Button type='button' variant={useTypedAddress ? 'default' : 'outline'} onClick={() => setUseTypedAddress(true)}>📝 Type Address</Button>
              </div>
            </FormItem>

            {!useTypedAddress ? (
              <FormItem>
                <Button type='button' onClick={handleUseCurrentLocation} className='w-full'>Detect Current Location</Button>
                {resolvedAddress && !useTypedAddress && (<p className='text-sm text-green-600 mt-2 p-2 border border-green-200 rounded-md bg-green-50'>Detected: {resolvedAddress}</p>)}
              </FormItem>
            ) : (
              <FormField name='location' control={form.control} render={({ field }) => (
                  <FormItem ref={inputRef}>
                    <FormLabel>Type Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Start typing address...'
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          fetchSuggestions(e.target.value);
                        }}
                      />
                    </FormControl>
                    {showSuggestions && suggestions.length > 0 && (
                      <div className='absolute w-[calc(100%-2.5rem)] border rounded-md mt-1 shadow-lg z-50 max-h-48 overflow-y-auto bg-white'>
                        {suggestions.map((suggestion) => (
                          <div
                            key={suggestion.place_id}
                            className='px-3 py-2 cursor-pointer text-black bg-white hover:bg-gray-100'
                            onClick={() => handleSuggestionClick(suggestion.place_id)}
                          >
                            {suggestion.description}
                          </div>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type='submit' disabled={loading} className='w-full'>
              {loading ? 'Saving...' : 'Save Vendor'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}