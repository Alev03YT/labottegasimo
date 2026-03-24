import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    key: 'uncinetto',
    title: 'Uncinetto',
    description: 'Amigurumi, coperte, accessori e tanto altro',
  },
  {
    key: 'ferri',
    title: 'Lavoro a Ferri',
    description: 'Sciarpe, cappelli, maglieria artigianale',
  },
  {
    key: 'perline',
    title: 'Perline & Gioielli',
    description: 'Collane, bracciali, orecchini handmade',
  },
];

export default function CategoryCards({ images }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-14">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3 block">
          Le Nostre Categorie
        </span>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          Esplora le Creazioni
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <Link
              to={`/Catalog?category=${cat.key}`}
              className="group block relative rounded-2xl overflow-hidden aspect-[4/3]"
            >
              <img
                src={images[cat.key]}
                alt={cat.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-heading text-xl font-semibold text-white mb-1">
                  {cat.title}
                </h3>
                <p className="text-white/70 text-sm mb-3">{cat.description}</p>
                <span className="inline-flex items-center text-white/90 text-xs font-medium group-hover:text-white transition-colors">
                  Scopri
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}