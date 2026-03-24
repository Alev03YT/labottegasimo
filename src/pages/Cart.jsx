const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customer_name: '',
    customer_email: '',
    shipping_address: '',
    notes: '',
  });

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cartItems'],
    queryFn: () => db.entities.CartItem.list(),
    initialData: [],
  });

  const updateQtyMutation = useMutation({
    mutationFn: ({ id, quantity }) => db.entities.CartItem.update(id, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cartItems'] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: (id) => db.entities.CartItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      toast.success('Rimosso dal carrello');
    },
  });

  const ADMIN_EMAIL = 'labottegadisimo@gmail.com';

  const buildItemsHtml = () =>
    cartItems.map(i => `<li>${i.product_name} × ${i.quantity || 1} — €${((i.price || 0) * (i.quantity || 1)).toFixed(2)}</li>`).join('');

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const order = await db.entities.Order.create({
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity || 1,
        })),
        total,
        status: 'in_attesa',
        ...orderForm,
      });
      // Clear cart
      for (const item of cartItems) {
        await db.entities.CartItem.delete(item.id);
      }

      const itemsList = buildItemsHtml();

      // Email conferma al cliente
      await db.integrations.Core.SendEmail({
        to: orderForm.customer_email,
        subject: '✅ Ordine confermato – La Bottega di Simo',
        body: `<h2>Grazie per il tuo ordine, ${orderForm.customer_name}!</h2>
<p>Il tuo ordine è stato ricevuto ed è <strong>in lavorazione</strong>.</p>
<h3>Riepilogo ordine</h3>
<ul>${itemsList}</ul>
<p><strong>Totale: €${total.toFixed(2)}</strong></p>
${orderForm.shipping_address ? `<p>📍 Spedizione a: ${orderForm.shipping_address}</p>` : ''}
${orderForm.notes ? `<p>📝 Note: ${orderForm.notes}</p>` : ''}
<br/><p>Ti aggiorneremo non appena il tuo ordine verrà spedito. 💕</p>
<p>– La Bottega di Simo</p>`,
      });

      // Notifica all'admin
      await db.integrations.Core.SendEmail({
        to: ADMIN_EMAIL,
        subject: `🛍️ Nuovo ordine da ${orderForm.customer_name} – €${total.toFixed(2)}`,
        body: `<h2>Nuovo ordine ricevuto!</h2>
<p><strong>Cliente:</strong> ${orderForm.customer_name} (${orderForm.customer_email})</p>
<h3>Articoli</h3>
<ul>${itemsList}</ul>
<p><strong>Totale: €${total.toFixed(2)}</strong></p>
${orderForm.shipping_address ? `<p>📍 Indirizzo: ${orderForm.shipping_address}</p>` : ''}
${orderForm.notes ? `<p>📝 Note: ${orderForm.notes}</p>` : ''}`,
      });

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      toast.success('Ordine confermato! 🎉');
      navigate('/Orders');
    },
  });

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-secondary rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-10">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3 block">
          Il Tuo Carrello
        </span>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          Carrello ({cartItems.length})
        </h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-4">Il tuo carrello è vuoto</p>
          <Link to="/Catalog">
            <Button variant="outline" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continua lo Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Cart Items */}
          <div className="space-y-3">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-sm md:text-base truncate">{item.product_name}</h3>
                    <p className="text-sm text-primary font-semibold">€{item.price?.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-7 h-7 rounded-full"
                      onClick={() => {
                        if ((item.quantity || 1) <= 1) {
                          removeItemMutation.mutate(item.id);
                        } else {
                          updateQtyMutation.mutate({ id: item.id, quantity: (item.quantity || 1) - 1 });
                        }
                      }}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity || 1}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-7 h-7 rounded-full"
                      onClick={() => updateQtyMutation.mutate({ id: item.id, quantity: (item.quantity || 1) + 1 })}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <span className="font-semibold text-foreground text-sm md:text-base w-20 text-right">
                    €{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeItemMutation.mutate(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Total */}
          <div className="border-t border-border pt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-heading font-semibold">Totale</span>
              <span className="text-2xl font-bold text-foreground">€{total.toFixed(2)}</span>
            </div>

            {!showCheckout ? (
              <Button
                className="w-full rounded-full py-6 text-sm font-medium bg-primary hover:bg-primary/90"
                onClick={async () => {
                  const isAuth = await db.auth.isAuthenticated();
                  if (!isAuth) { db.auth.redirectToLogin(window.location.href); return; }
                  setShowCheckout(true);
                }}
              >
                Procedi all'Ordine
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 bg-secondary/30 rounded-2xl p-6"
              >
                <h3 className="font-heading text-lg font-semibold mb-4">Dati per l'Ordine</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input
                      value={orderForm.customer_name}
                      onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })}
                      placeholder="Mario Rossi"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={orderForm.customer_email}
                      onChange={(e) => setOrderForm({ ...orderForm, customer_email: e.target.value })}
                      placeholder="mario@email.com"
                      className="rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Indirizzo di Spedizione</Label>
                  <Textarea
                    value={orderForm.shipping_address}
                    onChange={(e) => setOrderForm({ ...orderForm, shipping_address: e.target.value })}
                    placeholder="Via Roma 1, 00100, Roma (RM)"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Note (opzionale)</Label>
                  <Textarea
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                    placeholder="Istruzioni speciali per la consegna..."
                    className="rounded-lg"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setShowCheckout(false)}
                  >
                    Indietro
                  </Button>
                  <Button
                    className="flex-1 rounded-full py-5 bg-primary hover:bg-primary/90"
                    onClick={() => placeOrderMutation.mutate()}
                    disabled={!orderForm.customer_name || !orderForm.customer_email || !orderForm.shipping_address || placeOrderMutation.isPending}
                  >
                    {placeOrderMutation.isPending ? 'Elaborazione...' : 'Conferma Ordine'}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}