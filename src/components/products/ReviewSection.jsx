const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? 'cursor-default' : 'cursor-pointer'}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/40'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    db.auth.me().then(async (u) => {
      setUser(u);
      // Check if user has purchased this product
      const orders = await db.entities.Order.filter({ created_by: u.email });
      const purchased = orders.some(o =>
        o.items?.some(item => item.product_id === productId)
      );
      setHasPurchased(purchased);
    }).catch(() => {});
  }, [productId]);

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => db.entities.Review.filter({ product_id: productId }, '-created_date', 50),
    initialData: [],
  });

  const alreadyReviewed = user && reviews.some(r => r.created_by === user.email);

  const submitMutation = useMutation({
    mutationFn: () => db.entities.Review.create({
      product_id: productId,
      rating,
      comment,
      author_name: user.full_name || user.email,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      toast.success('Recensione pubblicata!');
      setRating(0);
      setComment('');
    },
  });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="mt-14 border-t border-border pt-10">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground">Recensioni</h2>
        {avgRating && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(avgRating)} readonly />
            <span className="text-sm text-muted-foreground font-medium">{avgRating} / 5 ({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Form per nuova recensione */}
      {user && hasPurchased && !alreadyReviewed && (
        <div className="bg-secondary/30 rounded-2xl p-6 mb-8">
          <h3 className="font-medium text-foreground mb-4">Lascia la tua recensione</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Valutazione</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <Textarea
              placeholder="Scrivi un commento sul prodotto..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="rounded-xl"
              rows={3}
            />
            <Button
              className="rounded-full bg-primary hover:bg-primary/90"
              disabled={rating === 0 || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
            >
              Pubblica Recensione
            </Button>
          </div>
        </div>
      )}

      {user && hasPurchased && alreadyReviewed && (
        <p className="text-sm text-muted-foreground mb-6 italic">Hai già lasciato una recensione per questo prodotto.</p>
      )}

      {user && !hasPurchased && (
        <p className="text-sm text-muted-foreground mb-6 italic">Solo chi ha acquistato questo prodotto può lasciare una recensione.</p>
      )}

      {/* Lista recensioni */}
      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nessuna recensione ancora. Sii il primo!</p>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-4 p-4 rounded-xl bg-card border border-border/50">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                {review.author_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{review.author_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {review.created_date ? format(new Date(review.created_date), 'd MMM yyyy', { locale: it }) : ''}
                  </span>
                </div>
                <StarRating value={review.rating} readonly />
                {review.comment && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{review.comment}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}