import { Heart, Instagram, ShoppingCart } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

export default function Header({ cartCount, onCartClick }: HeaderProps) {
  return (
    <header className="glass border-b border-rose-100/40 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="heart-pulse">
              <Heart className="text-rose-500 fill-rose-500" size={36} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">
                RecuerdaQueTeQuiero
              </h1>
              <p className="text-sm text-rose-600 italic font-light">Artesanía hecha con amor</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com/recuerdaquetequiero"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-500 hover:text-rose-700 transition-all duration-300 hover:scale-110"
              aria-label="Síguenos en Instagram"
            >
              <Instagram size={26} />
            </a>

            <button
              onClick={onCartClick}
              className="relative text-rose-500 hover:text-rose-700 transition-all duration-300 hover:scale-110"
              aria-label="Carrito de compras"
            >
              <ShoppingCart size={26} />
              {cartCount > 0 && (
                <span className="absolute -top-3 -right-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
