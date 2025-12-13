import { FileText, ShoppingBag, Star } from 'lucide-react';
import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  return (
    <div className="card-hover bg-white rounded-2xl overflow-hidden shadow-md border border-rose-100/50 fade-in">
      <div className="relative overflow-hidden h-72 bg-gradient-to-br from-rose-50 to-amber-50">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = 'https://images.pexels.com/photos/6140688/pexels-photo-6140688.jpeg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-4 right-4 flex gap-2">
          {product.type === 'pattern' ? (
            <span className="bg-white/95 backdrop-blur text-amber-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-amber-200 flex items-center gap-1.5 shadow-md">
              <FileText size={14} />
              Patrón
            </span>
          ) : (
            <span className="bg-white/95 backdrop-blur text-rose-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-rose-200 flex items-center gap-1.5 shadow-md">
              <ShoppingBag size={14} />
              Creación
            </span>
          )}
        </div>

        {product.difficulty_level && (
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-1 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg shadow-md">
              <Star size={13} className="text-amber-500 fill-amber-500" />
              <span className="text-xs font-medium text-gray-700">
                {product.difficulty_level === 'beginner' && 'Principiante'}
                {product.difficulty_level === 'intermediate' && 'Intermedio'}
                {product.difficulty_level === 'advanced' && 'Avanzado'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">{product.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{product.description}</p>

        <div className="flex items-end justify-between mt-6">
          <div>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">
              ${product.price.toFixed(2)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails(product)}
              className="px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-100 transition-all duration-200 text-sm font-semibold border border-gray-200"
            >
              Ver más
            </button>
            <button
              onClick={() => onAddToCart(product)}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-lg hover:from-rose-600 hover:to-amber-600 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
