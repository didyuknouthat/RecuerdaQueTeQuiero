import { X, Minus, Plus, Trash2, Package } from 'lucide-react';
import type { CartItem } from '../types/product';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export default function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right-96 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-amber-50">
          <h2 className="text-2xl font-serif font-bold text-gray-800">Tu Carrito</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-white rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <Package className="mx-auto text-rose-200 mb-4" size={48} />
              <p className="text-gray-500 text-lg font-semibold">Tu carrito está vacío</p>
              <p className="text-gray-400 text-sm mt-2">
                Agrega productos para comenzar tu compra
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-gradient-to-br from-rose-50 to-amber-50 p-4 rounded-xl border border-rose-100/50 hover:shadow-md transition-shadow">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/6140688/pexels-photo-6140688.jpeg';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500 font-bold mt-1">
                    ${item.price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-700">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="ml-auto text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-rose-100 p-6 space-y-4 bg-gradient-to-t from-rose-50 to-transparent">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-gray-600">
                <span className="font-medium">Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600 text-sm">
                <span className="font-medium">Envío:</span>
                <span>Próximamente</span>
              </div>
              <div className="border-t border-rose-200 pt-2 flex items-center justify-between">
                <span className="font-serif font-bold text-gray-800">Total:</span>
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
            <button className="w-full btn-primary justify-center">
              Proceder al Pago
            </button>
            <p className="text-xs text-center text-gray-500">
              El sistema de pagos será configurado próximamente
            </p>
          </div>
        )}
      </div>
    </>
  );
}
