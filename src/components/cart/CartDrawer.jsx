const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer({ open, onClose, cartItems = [] }) {
  const queryClient = useQueryClient();

  const updateQty = useMutation({
    mutationFn: ({ id, quantity }) => db.entities.CartItem.update(id, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cartItems'] }),
  });

  const removeItem = useMutation({
    mutationFn: (id) => db.entities.CartItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      toast.success('Rimosso dal carrello');
    },
  });

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b border-border/50">
          <SheetTitle className="font-heading text-xl flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Carrello ({cartItems.length})
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground text-sm text-center">Il tuo carrello è vuoto.<br/>Aggiungi qualcosa di bello!</p>
            <Button variant="outline" className="rounded-full" onClick={onClose} asChild>
              <Link to="/Catalog">Vai al Catalogo</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.product_name}</p>
                      <p className="text-xs text-primary font-semibold mt-0.5">€{item.price?.toFixed(2)}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <button
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                          onClick={() => {
                            if ((item.quantity || 1) <= 1) removeItem.mutate(item.id);
                            else updateQty.mutate({ id: item.id, quantity: (item.quantity || 1) - 1 });
                          }}
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-medium w-5 text-center">{item.quantity || 1}</span>
                        <button
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                          onClick={() => updateQty.mutate({ id: item.id, quantity: (item.quantity || 1) + 1 })}
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm font-semibold">
                        €{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                      <button
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => removeItem.mutate(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-border/50 space-y-4 bg-secondary/20">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subtotale</span>
                <span className="text-lg font-bold font-heading">€{total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Spedizione calcolata al checkout</p>
              <Button
                className="w-full rounded-full py-5 bg-primary hover:bg-primary/90 text-sm font-medium"
                onClick={onClose}
                asChild
              >
                <Link to="/Cart">
                  Procedi al Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <button
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
                onClick={onClose}
              >
                Continua lo shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}