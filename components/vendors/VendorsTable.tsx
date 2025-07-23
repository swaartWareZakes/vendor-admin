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
import { Vendor } from '@/app/(main)/vendors/page';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

interface VendorsTableProps {
  vendors: Vendor[];
  onDeleteSuccess: () => void;
}

const VendorsTable = ({ vendors, onDeleteSuccess }: VendorsTableProps) => {
    const handleDelete = async (vendorId: string) => {
      const confirmDelete = confirm('Are you sure you want to delete this vendor?');
      if (!confirmDelete) return;
    
      const { error, data } = await supabase.from('vendors').delete().eq('id', vendorId);
    
      console.log("Delete result", { error, data }); // 👈 Add this
    
      if (error) {
        toast({
          title: '❌ Failed to delete vendor',
          description: error.message,
        });
      } else {
        toast({ title: '✅ Vendor deleted successfully' });
        console.log('Deleting vendor with ID:', vendorId);

        onDeleteSuccess();
      }
    };
  

  return (
    <div className='mt-10'>
      <h3 className='text-2xl mb-4 font-semibold'>Vendors</h3>
      <Table>
        <TableCaption>A list of registered vendors</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className='hidden md:table-cell'>Category</TableHead>
            <TableHead className='hidden md:table-cell'>Price</TableHead>
            <TableHead className='hidden md:table-cell text-right'>Rating</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => (
            <TableRow key={vendor.id}>
              <TableCell>
                {vendor.image_url ? (
                  <img
                    src={vendor.image_url}
                    alt={vendor.title}
                    className='w-14 h-14 object-cover rounded'
                  />
                ) : (
                  <span className='text-sm italic text-gray-500'>No image</span>
                )}
              </TableCell>
              <TableCell>{vendor.title}</TableCell>
              <TableCell className='hidden md:table-cell'>
                <div className='flex flex-wrap gap-1'>
                  {(Array.isArray(vendor.category)
                    ? vendor.category
                    : vendor.category.split(',').map((cat: string) => cat.trim())
                  ).map((cat: string) => (
                    <span
                      key={cat}
                      className='bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full'
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className='hidden md:table-cell'>
                {vendor.price_range || '-'}
              </TableCell>
              <TableCell className='text-right hidden md:table-cell'>
                {vendor.rating}
              </TableCell>
              <TableCell className='flex gap-2 justify-end'>
                <Link href={`/vendors/edit/${vendor.id}`}>
                  <Button size='sm' className='text-xs'>Edit</Button>
                </Link>
                <Button
                  variant='destructive'
                  size='sm'
                  className='text-xs'
                  onClick={() => handleDelete(vendor.id)}
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

export default VendorsTable;
