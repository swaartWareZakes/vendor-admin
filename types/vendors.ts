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
  added_by_user?: {
    email: string;
    name?: string;
  };
}
