import { useState, useEffect, useCallback } from 'react';
import { X, FileText, ShoppingBag, Award, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Product } from '../types/product';
import useEmblaCarousel from 'embla-carousel-react';

interface ProductDetailsProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetails({ product, isOpen, onClose, onAddToCart }: ProductDetailsProps) {
  if (!isOpen || !product) return null;

  // Prioriza la nueva lista de imágenes, si no existe, usa la imagen antigua
  const images = (product.image_urls && product.image_urls.length > 0) 
    ? product.image_urls 
    : (product.image_url ? [product.image_url] : []);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-rose-50 to-amber-50 border-b border-rose-100 p-6 flex items-center justify-between z-10">
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
              {/* --- INICIO DEL CARRUSEL --- */}
              <div className="relative">
                <div className="overflow-hidden rounded-2xl shadow-lg border border-rose-100" ref={emblaRef}>
                  <div className="flex">
                    {images.length > 0 ? images.map((imgUrl, index) => (
                      <div className="relative flex-[0_0_100%] aspect-square" key={index}>
                        <img
                          src={imgUrl}
                          alt={`${product.name} - foto ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/6140688/pexels-photo-6140688.jpeg';
                          }}
                        />
                      </div>
                    )) : (
                      <div className="relative flex-[0_0_100%] aspect-square bg-gray-100 flex items-center justify-center">
                         <img
                          src='https://images.pexels.com/photos/6140688/pexels-photo-6140688.jpeg'
                          alt="Imagen por defecto"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {images.length > 1 && (
                  <>
                    <button onClick={scrollPrev} className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all">
                      <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <button onClick={scrollNext} className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all">
                      <ArrowRight size={20} className="text-gray-700" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {scrollSnaps.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => scrollTo(index)}
                          className={`w-2 h-2 rounded-full transition-all ${index === selectedIndex ? 'bg-rose-500 scale-125' : 'bg-white/80'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {/* --- FIN DEL CARRUSEL --- */}

              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">{product.name}</h2>
                  <p className="text-rose-600 text-sm font-medium uppercase tracking-wide">
                    {product.category}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-rose-50 to-amber-50 p-6 rounded-2xl border border-rose-100">
                  <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">
                    {product.price.toFixed(2)}€
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
