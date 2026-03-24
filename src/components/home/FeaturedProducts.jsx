import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../products/ProductCard';

export default function FeaturedProducts({ products, onAddToCart }) {
  if (!products?.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3 block">
            Scelti per Te
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            In Evidenza
          </h2>
        </div>
        <Link
          to="/Catalog"
          className="hidden md:flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Vedi Tutto
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
      <div className="mt-8 text-center md:hidden">
        <Link
          to="/Catalog"
          className="inline-flex items-center text-sm font-medium text-primary"
        >
          Vedi Tutto
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </section>
  );
}