import { Vendor } from '@/types/vendors';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RecentVendorsProps {
  vendors: Vendor[];
}

const RecentVendors = ({ vendors }: RecentVendorsProps) => {
  const recentVendors = vendors.slice(0, 5); // Get the 5 most recent

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Vendors</CardTitle>
        <CardDescription>
          A list of the most recently added vendors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead className='text-right'>Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentVendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <Avatar>
                      <AvatarImage
                        src={vendor.image_url_food || undefined}
                        alt={vendor.title}
                      />
                      <AvatarFallback>
                        {vendor.title.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-medium'>{vendor.title}</p>
                      <p className='text-sm text-muted-foreground'>
                        {Array.isArray(vendor.category)
                          ? vendor.category.join(', ')
                          : vendor.category}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className='text-right font-medium'>
                  {vendor.rating}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentVendors;