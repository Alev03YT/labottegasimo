const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Package, Clock, Truck, CheckCircle2, ShoppingBag, MapPin, StickyNote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion } from 'framer-motion';

const STATUS_STEPS = ['in_attesa', 'confermato', 'spedito', 'consegnato'];

const statusConfig = {
  in_attesa:  { label: 'In Attesa',   icon: Clock,        color: 'bg-amber-100 text-amber-700 border-amber-200' },
  confermato: { label: 'Confermato',  icon: Package,      color: 'bg-blue-100 text-blue-700 border-blue-200' },
  spedito:    { label: 'Spedito',     icon: Truck,        color: 'bg-purple-100 text-purple-700 border-purple-200' },
  consegnato: { label: 'Consegnato',  icon: CheckCircle2, color: 'bg-green-100 text-green-700 border-green-200' },
};

function StatusTracker({ status }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0 mt-4">
      {STATUS_STEPS.map((step, i) => {
        const cfg = statusConfig[step];
        const Icon = cfg.icon;
        const done = i <= currentIdx;
        const isLast = i === STATUS_STEPS.length - 1;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${done ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border text-muted-foreground'}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] font-medium ${done ? 'text-primary' : 'text-muted-foreground'}`}>
                {cfg.label}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mb-4 ${i < currentIdx ? 'bg-primary' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function Orders() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    db.auth.me().then(setUser).catch(() => {
      db.auth.redirectToLogin(window.location.href);
    });
  }, []);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: () => db.entities.Order.filter({ created_by: user.email }, '-created_date', 50),
    enabled: !!user,
    initialData: [],
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-10">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3 block">
          Storico Acquisti
        </span>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          I Miei Ordini
        </h1>
      </div>

      {isLoading || !user ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-40 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-4">Non hai ancora effettuato ordini</p>
          <Link to="/Catalog">
            <Button variant="outline" className="rounded-full">Inizia a Comprare</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order, i) => {
            const status = statusConfig[order.status] || statusConfig.in_attesa;
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-border/50 overflow-hidden">
                  <CardHeader className="pb-2 bg-secondary/20">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Ordine del {order.created_date ? format(new Date(order.created_date), "d MMMM yyyy", { locale: it }) : '—'}
                        </p>
                        <p className="font-heading text-xl font-bold text-foreground mt-0.5">
                          €{order.total?.toFixed(2)}
                        </p>
                      </div>
                      <Badge className={`${status.color} border flex items-center gap-1.5 text-xs px-3 py-1`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </Badge>
                    </div>
                    <StatusTracker status={order.status} />
                  </CardHeader>

                  <CardContent className="pt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Articoli
                    </h4>
                    <div className="space-y-2 mb-4">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-foreground">
                            {item.product_name}
                            <span className="text-muted-foreground ml-1">× {item.quantity || 1}</span>
                          </span>
                          <span className="font-semibold text-foreground">
                            €{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border/50 pt-3 space-y-1.5">
                      {order.shipping_address && (
                        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          {order.shipping_address}
                        </p>
                      )}
                      {order.notes && (
                        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <StickyNote className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          {order.notes}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}