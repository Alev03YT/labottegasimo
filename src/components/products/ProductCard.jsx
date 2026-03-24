import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CATEGORY_LABELS } from '@/components/categories';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Link to={`/ProductDetail?id=${product.id}`} className="block">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary mb-4">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ShoppingBag className="w-12 h-12 opacity-30" />
            </div>
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="bg-foreground text-background px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider">
                Esaurito
              </span>
            </div>
          )}
          {product.featured && product.in_stock !== false && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">
              In Evidenza
            </span>
          )}
        </div>
      </Link>
      <div className="space-y-1.5">
        <span className="text-[10px] font-medium uppercase tracking-widest text-primary">
          {CATEGORY_LABELS[product.category] || product.category}
        </span>
        <Link to={`/ProductDetail?id=${product.id}`}>
          <h3 className="font-heading text-base font-medium text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-semibold text-foreground">
            €{product.price?.toFixed(2)}
          </span>
          {product.in_stock !== false && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full h-8 px-3 text-xs border-primary/30 hover:bg-primary hover:text-primary-foreground"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.(product);
              }}
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-1" />
              Aggiungi
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}