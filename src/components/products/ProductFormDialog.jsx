const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';

import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Loader2, ImageIcon } from 'lucide-react';
import { CATEGORY_LABELS } from '@/components/categories';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'borse',
  image_url: '',
  in_stock: true,
  quantity: 0,
  featured: false,
  materials: '',
  colors: '',
};

export default function ProductFormDialog({ open, onOpenChange, editingProduct }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setForm({ ...EMPTY_FORM, ...editingProduct, price: editingProduct.price?.toString() || '', quantity: editingProduct.quantity?.toString() || '0' });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingProduct, open]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, price: parseFloat(data.price) || 0, quantity: parseInt(data.quantity) || 0 };
      return editingProduct
        ? db.entities.Product.update(editingProduct.id, payload)
        : db.entities.Product.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(editingProduct ? 'Prodotto aggiornato!' : 'Prodotto aggiunto!');
      onOpenChange(false);
    },
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, image_url: file_url }));
    setUploading(false);
    toast.success('Immagine caricata!');
  };

  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {editingProduct ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Immagine */}
          <div className="space-y-2">
            <Label>Immagine</Label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                {form.image_url ? (
                  <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                <Button variant="outline" size="sm" className="rounded-full pointer-events-none" asChild>
                  <span>
                    {uploading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1.5" />}
                    {uploading ? 'Caricamento...' : 'Carica Immagine'}
                  </span>
                </Button>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={f('name')} placeholder="Nome prodotto" />
            </div>
            <div className="space-y-1.5">
              <Label>Prezzo (€) *</Label>
              <Input type="number" value={form.price} onChange={f('price')} placeholder="0.00" step="0.01" />
            </div>
            <div className="space-y-1.5">
              <Label>Quantità disponibile</Label>
              <Input type="number" value={form.quantity} onChange={f('quantity')} placeholder="0" min="0" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Categoria *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Descrizione</Label>
              <Textarea value={form.description} onChange={f('description')} placeholder="Descrizione del prodotto..." rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Materiali</Label>
              <Input value={form.materials} onChange={f('materials')} placeholder="es. Cotone 100%" />
            </div>
            <div className="space-y-1.5">
              <Label>Colori</Label>
              <Input value={form.colors} onChange={f('colors')} placeholder="es. Rosa, Bianco" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Switch checked={form.in_stock} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} />
              <Label className="cursor-pointer">Disponibile</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
              <Label className="cursor-pointer">In Evidenza</Label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>Annulla</Button>
            <Button
              className="flex-1 rounded-full bg-primary hover:bg-primary/90"
              disabled={!form.name || !form.price || saveMutation.isPending}
              onClick={() => saveMutation.mutate(form)}
            >
              {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingProduct ? 'Salva Modifiche' : 'Aggiungi Prodotto'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}