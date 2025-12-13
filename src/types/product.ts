export interface Product {
  id: string;
  title: string;
  description: string;
  type: 'creation' | 'pattern';
  price: number;
  image_url: string;
  category: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  materials?: string;
  is_available: boolean;
  created_at: string;
}

export interface CartItem extends Product {
  quantity: number;
}
