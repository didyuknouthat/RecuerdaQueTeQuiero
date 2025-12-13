import { useEffect, useState } from 'react';
import { Filter, Sparkles } from 'lucide-react';
import { supabase } from './lib/supabase';
import type { Product, CartItem } from './types/product';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'all' | 'creation' | 'pattern'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.type === filter));
    }
  }, [filter, products]);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-pink-50">
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16 fade-in">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="text-amber-500" size={24} />
            <span className="text-sm font-semibold text-amber-600 uppercase tracking-widest">
              Bienvenido a nuestro espacio
            </span>
            <Sparkles className="text-amber-500" size={24} />
          </div>
          <h2 className="heading-xl mb-6">
            Artesanía hecha con amor
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Descubre piezas únicas y patrones para crear tus propias obras maestras. Cada creación es especial y hecha pensando en ti.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-12 flex-wrap fade-in">
          <div className="flex items-center gap-2 text-gray-600 px-4 py-2">
            <Filter size={18} />
            <span className="font-medium">Filtrar:</span>
          </div>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${filter === 'all'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Todo
          </button>
          <button
            onClick={() => setFilter('creation')}
            className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${filter === 'creation'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Piezas Artesanales
          </button>
          <button
            onClick={() => setFilter('pattern')}
            className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${filter === 'pattern'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Patrones
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Cargando nuestras creaciones...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg font-medium">
              No hay productos disponibles en este momento
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Vuelve pronto para descubrir nuevas creaciones
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gradient-to-r from-rose-50 to-amber-50 border-t border-rose-100 mt-24 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-700 font-semibold text-lg">
              Hecho con <span className="text-rose-500 inline-block heart-pulse">❤</span> por <span className="font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-amber-600">RecuerdaQueTeQuiero</span>
            </p>
            <p className="text-gray-600 mt-3">
              Cada pieza es única y creada especialmente para ti
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Síguenos en <a href="https://instagram.com/recuerdaquetequiero" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-700 font-semibold">Instagram</a> para ver nuestras nuevas creaciones
            </p>
          </div>
        </div>
      </footer>

      <ProductDetails
        product={selectedProduct}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
}

export default App;
