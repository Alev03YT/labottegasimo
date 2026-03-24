const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Package, ImageIcon, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORY_LABELS } from '@/components/categories';
import ProductFormDialog from '@/components/products/ProductFormDialog';

export default function Admin() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    db.auth.me()
      .then(u => setIsAdmin(u?.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => db.entities.Product.list('-created_date', 200),
    initialData: [],
    enabled: isAdmin === true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Prodotto eliminato');
    },
  });

  const toggleStockMutation = useMutation({
    mutationFn: ({ id, in_stock }) => db.entities.Product.update(id, { in_stock }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const openNew = () => { setEditingProduct(null); setOpen(true); };
  const openEdit = (product) => { setEditingProduct(product); setOpen(true); };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <ShieldAlert className="w-16 h-16 text-muted-foreground/30" />
        <h2 className="font-heading text-2xl font-bold text-foreground">Accesso Negato</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Solo gli amministratori possono accedere a questa sezione.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3 block">Admin</span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Gestione Prodotti</h1>
          <p className="text-muted-foreground text-sm mt-1">{products.length} prodotti nel catalogo</p>
        </div>
        <Button className="rounded-full bg-primary hover:bg-primary/90" onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" /> Nuovo Prodotto
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Nessun prodotto. Aggiungine uno!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-foreground text-sm truncate">{product.name}</h3>
                  {product.featured && (
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 border">In Evidenza</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[product.category] || product.category}</span>
                  <span className="text-xs font-semibold text-primary">€{product.price?.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">Qtà: {product.quantity ?? 0}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {product.in_stock ? 'Disponibile' : 'Esaurito'}
                </span>
                <Switch
                  checked={product.in_stock !== false}
                  onCheckedChange={(val) => toggleStockMutation.mutate({ id: product.id, in_stock: val })}
                />
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-destructive"
                  onClick={() => {
                    if (confirm(`Eliminare "${product.name}"?`)) deleteMutation.mutate(product.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ProductFormDialog open={open} onOpenChange={setOpen} editingProduct={editingProduct} />
    </div>
  );
}