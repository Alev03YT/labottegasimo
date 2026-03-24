const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingBag, Heart, Package } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReviewSection from '../components/products/ReviewSection';

const categoryLabels = {
  uncinetto: 'Uncinetto',
  ferri: 'Ferri',
  perline: 'Perline',
};

export default function ProductDetail() {
  const { openCart } = useOutletContext() || {};
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await db.entities.Product.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const cartItems = await db.entities.CartItem.list();
      const existing = cartItems.find((item) => item.product_id === product.id);
      if (existing) {
        return db.entities.CartItem.update(existing.id, {
          quantity: (existing.quantity || 1) + 1,
        });
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-secondary rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-secondary rounded w-20" />
            <div className="h-8 bg-secondary rounded w-64" />
            <div className="h-20 bg-secondary rounded" />
            <div className="h-8 bg-secondary rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Prodotto non trovato.</p>
        <Link to="/Catalog" className="text-primary text-sm mt-4 inline-block">
          Torna al catalogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/Catalog"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Torna al Catalogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-square rounded-2xl overflow-hidden bg-secondary"
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-20 h-20 text-muted-foreground/30" />
            </div>
          )}
          {product.featured && (
            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
              In Evidenza
            </Badge>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-2">
            {categoryLabels[product.category] || product.category}
          </span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold text-foreground mb-6">
            €{product.price?.toFixed(2)}
          </p>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed mb-6">
              {product.description}
            </p>
          )}

          <div className="space-y-3 mb-8">
            {product.materials && (
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground font-medium min-w-[80px]">Materiali:</span>
                <span className="text-foreground">{product.materials}</span>
              </div>
            )}
            {product.colors && (
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground font-medium min-w-[80px]">Colori:</span>
                <span className="text-foreground">{product.colors}</span>
              </div>
            )}
            <div className="flex gap-2 text-sm">
              <span className="text-muted-foreground font-medium min-w-[80px]">Disponibilità:</span>
              <span className={product.in_stock !== false ? 'text-accent' : 'text-destructive'}>
                {product.in_stock !== false ? 'Disponibile' : 'Esaurito'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-auto">
            <Button
              className="flex-1 rounded-full py-6 text-sm font-medium bg-primary hover:bg-primary/90"
              disabled={product.in_stock === false}
              onClick={async () => {
                const isAuth = await db.auth.isAuthenticated();
                if (!isAuth) { db.auth.redirectToLogin(window.location.href); return; }
                addToCartMutation.mutate();
              }}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              {product.in_stock !== false ? 'Aggiungi al Carrello' : 'Non Disponibile'}
            </Button>
          </div>
        </motion.div>
      </div>

      <ReviewSection productId={productId} />
    </div>
  );
}