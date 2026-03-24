import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Creazioni fatte a mano"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 lg:py-44">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl"
        >
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-4 block">
            Artigianato Italiano
          </span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Creazioni fatte a mano con{' '}
            <span className="text-primary italic">amore</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-md">
            Ogni pezzo è unico, realizzato con cura e dedizione. Scopri le nostre 
            creazioni ad uncinetto, ai ferri e con perline.
          </p>
          <Link to="/Catalog">
            <Button className="rounded-full px-8 py-6 text-sm font-medium bg-primary hover:bg-primary/90">
              Scopri la Collezione
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}