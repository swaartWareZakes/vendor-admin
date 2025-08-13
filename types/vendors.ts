export interface Vendor {
  id: string;
  title: string;
  category: string;
  rating: number;
  tags: string[];
  location: string;
  price_range: string;
  visitors: number;
  image_url_food: string | null;
  image_url_outside: string | null;
  inserted_at: string;
  user_id: string;
  added_by_user?: {
    email: string;
    name?: string;
  };
}
