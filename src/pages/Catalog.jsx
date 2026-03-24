const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Plus, Pencil } from 'lucide-react';
import ProductFormDialog from '@/components/products/ProductFormDialog';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/products/ProductCard';
import { CATEGORIES_FILTER } from '@/components/categories';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Novità' },
  { value: 'price_asc', label: 'Prezzo: crescente' },
  { value: 'price_desc', label: 'Prezzo: decrescente' },
];

export default function Catalog() {
  const { openCart } = useOutletContext() || {};
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || 'all';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [activeMaterial, setActiveMaterial] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    db.auth.me().then(u => setIsAdmin(u?.role === 'admin')).catch(() => {});
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => db.entities.Product.list('-created_date', 100),
    initialData: [],
  });

  // Estrai materiali unici dai prodotti
  const materials = useMemo(() => {
    const all = products
      .map((p) => p.materials)
      .filter(Boolean)
      .flatMap((m) => m.split(/[,;\/]+/).map((s) => s.trim().toLowerCase()))
      .filter(Boolean);
    return [...new Set(all)].sort();
  }, [products]);

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

  const handleAddToCart = async (product) => {
    const isAuth = await db.auth.isAuthenticated();
    if (!isAuth) { db.auth.redirectToLogin(window.location.href); return; }
    addToCartMutation.mutate(product);
  };

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const categoryMatch = activeCategory === 'all' || p.category === activeCategory;
      const searchMatch = !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const materialMatch = !activeMaterial || p.materials?.toLowerCase().includes(activeMaterial);
      return categoryMatch && searchMatch && materialMatch;
    });

    if (sortBy === 'price_asc') result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === 'price_desc') result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
    // 'newest' è già l'ordine di default dal backend

    return result;
  }, [products, activeCategory, searchQuery, activeMaterial, sortBy]);

  const activeFiltersCount = [activeCategory !== 'all', !!activeMaterial, !!searchQuery].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3 block">
          Tutti i Prodotti
        </span>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          Il Nostro Catalogo
        </h1>
      </div>

      {isAdmin && (
        <div className="mb-6">
          <Button className="rounded-full bg-primary hover:bg-primary/90" onClick={() => { setEditingProduct(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Aggiungi Prodotto
          </Button>
        </div>
      )}

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca prodotti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full bg-secondary/50 border-border/50"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48 rounded-full bg-secondary/50 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Categorie */}
      <div className="flex gap-2 flex-wrap mb-4">
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

      {/* Filtro Materiali */}
      {materials.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8 items-center">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mr-1">Materiali:</span>
          {materials.map((mat) => (
            <Badge
              key={mat}
              variant={activeMaterial === mat ? 'default' : 'outline'}
              className="cursor-pointer capitalize text-xs hover:bg-primary/10 transition-colors"
              onClick={() => setActiveMaterial(activeMaterial === mat ? '' : mat)}
            >
              {mat}
            </Badge>
          ))}
          {activeMaterial && (
            <button
              onClick={() => setActiveMaterial('')}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 ml-1"
            >
              <X className="w-3 h-3" /> Rimuovi filtro
            </button>
          )}
        </div>
      )}

      {/* Risultati */}
      {activeFiltersCount > 0 && (
        <p className="text-xs text-muted-foreground mb-4">{filtered.length} prodotti trovati</p>
      )}

      {/* Products Grid */}
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
          <p className="text-muted-foreground">Nessun prodotto trovato.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {filtered.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                />
                {isAdmin && (
                  <button
                    onClick={() => { setEditingProduct(product); setFormOpen(true); }}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil className="w-3.5 h-3.5 text-foreground" />
                  </button>
                )}
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} editingProduct={editingProduct} />
    </div>
  );
}