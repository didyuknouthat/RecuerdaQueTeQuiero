export interface Product {
  id: string;
  name: string; // Corregido de 'title' a 'name'
  description: string;
  type: 'creation' | 'pattern';
  price: number;
  image_url?: string; // La imagen antigua ahora es opcional
  image_urls?: string[]; // Nueva lista de imágenes
  category: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  materials?: string;
  is_available: boolean;
  created_at: string;
}

export interface CartItem extends Product {
  quantity: number;
}
