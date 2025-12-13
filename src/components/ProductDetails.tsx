import { X, FileText, ShoppingBag, Award } from 'lucide-react';
import type { Product } from '../types/product';

interface ProductDetailsProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetails({ product, isOpen, onClose, onAddToCart }: ProductDetailsProps) {
  if (!isOpen || !product) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-rose-50 to-amber-50 border-b border-rose-100 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {product.type === 'pattern' ? (
                <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border border-amber-200">
                  <FileText size={18} />
                  Patrón
                </span>
              ) : (
                <span className="bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border border-rose-200">
                  <ShoppingBag size={18} />
                  Creación
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-white rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="flex flex-col gap-4">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full rounded-2xl shadow-lg border border-rose-100"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/6140688/pexels-photo-6140688.jpeg';
                  }}
                />
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">{product.title}</h2>
                  <p className="text-rose-600 text-sm font-medium uppercase tracking-wide">
                    {product.category}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-rose-50 to-amber-50 p-6 rounded-2xl border border-rose-100">
                  <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">
                    ${product.price.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <h3 className="font-serif font-bold text-gray-800 mb-3 text-lg">Descripción</h3>
                    <p className="text-gray-600 leading-relaxed text-base">{product.description}</p>
                  </div>

                  {product.difficulty_level && (
                    <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <Award className="text-blue-600 flex-shrink-0" size={22} />
                      <div>
                        <p className="text-xs font-semibold text-blue-600 uppercase">Nivel de Dificultad</p>
                        <p className="text-blue-900 font-semibold">
                          {product.difficulty_level === 'beginner' && 'Principiante'}
                          {product.difficulty_level === 'intermediate' && 'Intermedio'}
                          {product.difficulty_level === 'advanced' && 'Avanzado'}
                        </p>
                      </div>
                    </div>
                  )}

                  {product.materials && (
                    <div>
                      <h3 className="font-serif font-bold text-gray-800 mb-2 text-lg">Materiales</h3>
                      <p className="text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        {product.materials}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  className="w-full btn-primary mt-4"
                >
                  Agregar al Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
