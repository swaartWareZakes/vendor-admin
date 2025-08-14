'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Vendor } from '@/types/vendors';
import { Profile } from '@/types/profiles';

// Define the props for our component
interface AnalyticsChartProps {
  vendors: Vendor[];
  profiles: Profile[];
}

// The new set of options for the dropdown
const availableFilters = [
  {
    value: 'vendors',
    label: 'New Vendors',
  },
  {
    value: 'users',
    label: 'New Users',
  },
];

const AnalyticsChart = ({ vendors, profiles }: AnalyticsChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [selection, setSelection] = useState('vendors');

  useEffect(() => {
    // This function processes the raw data into a monthly format for the chart
    const processData = () => {
      const monthlyData = new Array(12).fill(0).map((_, index) => {
        const monthName = new Date(0, index).toLocaleString('default', {
          month: 'short',
        });
        return { name: monthName, vendors: 0, users: 0 };
      });

      // Process vendors
      vendors.forEach((vendor) => {
        const month = new Date(vendor.inserted_at).getMonth();
        if (monthlyData[month]) {
          monthlyData[month].vendors += 1;
        }
      });

      // Process profiles (users)
      profiles.forEach((profile) => {
        const month = new Date(profile.updated_at).getMonth(); // Assuming updated_at is the creation time
        if (monthlyData[month]) {
          monthlyData[month].users += 1;
        }
      });

      setChartData(monthlyData);
    };

    processData();
  }, [vendors, profiles]); // Rerun when data changes

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <div>
            <CardTitle>Analytics For This Year</CardTitle>
            <CardDescription>New sign-ups per month</CardDescription>
          </div>
          <Select onValueChange={setSelection} defaultValue='vendors'>
            <SelectTrigger className='w-48 h-9'>
              <SelectValue placeholder='Select Data' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {availableFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type='monotone'
                dataKey={selection}
                stroke='#8884d8'
                strokeWidth={2}
                name={
                  availableFilters.find((f) => f.value === selection)?.label
                }
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsChart;