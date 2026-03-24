const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingBag, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORY_LABELS, CATEGORIES_FILTER } from '@/components/categories';

export default function Shop() {
  const { openCart } = useOutletContext() || {};
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    db.auth.me().then(u => setIsAdmin(u?.role === 'admin')).catch(() => {});
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => db.entities.Product.list('-created_date', 100),
    initialData: [],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (product) => {
      const cartItems = await db.entities.CartItem.list();
      const existing = cartItems.find((item) => item.product_id === product.id);
      if (existing) {
        return db.entities.CartItem.update(existing.id, { quantity: (existing.quantity || 1) + 1 });
      }
      return db.entities.CartItem.create({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url,
        price: product.price,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      toast.success('Aggiunto al carrello!');
      openCart?.();
    },
  });

  const toggleStockMutation = useMutation({
    mutationFn: ({ id, in_stock }) => db.entities.Product.update(id, { in_stock }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Disponibilità aggiornata');
    },
  });

  const handleAddToCart = async (product) => {
    const isAuth = await db.auth.isAuthenticated();
    if (!isAuth) { db.auth.redirectToLogin(window.location.href); return; }
    addToCartMutation.mutate(product);
  };

  const filtered = products.filter((p) => {
    if (!isAdmin && p.in_stock === false) return false;
    const categoryMatch = activeCategory === 'all' || p.category === activeCategory;
    const searchMatch = !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-10">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3 block">
          Acquista Ora
        </span>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          Prodotti Disponibili
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {isAdmin ? 'Modalità admin – gestisci la disponibilità dei prodotti' : 'Solo i prodotti disponibili per l\'acquisto'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca prodotti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full bg-secondary/50 border-border/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES_FILTER.map((cat) => (
            <Button
              key={cat.key}
              variant={activeCategory === cat.key ? 'default' : 'outline'}
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-secondary rounded-2xl mb-4" />
              <div className="h-3 bg-secondary rounded w-16 mb-2" />
              <div className="h-4 bg-secondary rounded w-32 mb-2" />
              <div className="h-4 bg-secondary rounded w-20" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Nessun prodotto disponibile al momento.</p>
          <Link to="/Catalog">
            <Button variant="outline" className="rounded-full mt-4">Vedi tutto il catalogo</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group relative"
              >
                <Link to={`/ProductDetail?id=${product.id}`} className="block">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary mb-3">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    {product.in_stock === false && isAdmin && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Badge className="bg-destructive text-destructive-foreground">Esaurito</Badge>
                      </div>
                    )}
                    {product.featured && (
                      <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px]">
                        In Evidenza
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-primary font-medium">
                    {CATEGORY_LABELS[product.category] || product.category}
                  </span>
                  <h3 className="font-medium text-foreground text-sm mt-0.5 leading-snug line-clamp-2">{product.name}</h3>
                  <p className="text-sm font-semibold text-foreground mt-1">€{product.price?.toFixed(2)}</p>
                  {/* Quantità disponibile */}
                  {product.in_stock !== false && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {product.quantity > 0 ? `${product.quantity} disponibili` : 'Disponibile'}
                    </p>
                  )}
                </Link>

                <div className="mt-2 space-y-1.5">
                  {product.in_stock !== false ? (
                    <Button
                      size="sm"
                      className="w-full rounded-full text-xs bg-primary hover:bg-primary/90"
                      onClick={() => handleAddToCart(product)}
                      disabled={addToCartMutation.isPending}
                    >
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      Aggiungi al Carrello
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full rounded-full text-xs" disabled>
                      Non Disponibile
                    </Button>
                  )}
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      className={`w-full rounded-full text-xs ${product.in_stock !== false ? 'border-destructive text-destructive hover:bg-destructive/10' : 'border-accent text-accent hover:bg-accent/10'}`}
                      onClick={() => toggleStockMutation.mutate({ id: product.id, in_stock: product.in_stock === false })}
                    >
                      {product.in_stock !== false ? 'Segna Esaurito' : 'Segna Disponibile'}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}