import React from 'react';
import { Heart, Mail, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-primary fill-primary" />
              <span className="font-heading text-lg font-semibold">La Bottega di Simo</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Creazioni artigianali fatte a mano con amore. Ogni pezzo è unico, 
              realizzato con cura e passione per l'arte dell'uncinetto, dei ferri e delle perline.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold mb-4 uppercase tracking-wider">Categorie</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Uncinetto</li>
              <li>Lavoro a Ferri</li>
              <li>Perline & Gioielli</li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold mb-4 uppercase tracking-wider">Contatti</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@maniefili.it</span>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                <span>@maniefili</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border/50 mt-8 pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 La Bottega di Simo — Fatto a mano con ❤️ in Italia
          </p>
        </div>
      </div>
    </footer>
  );
}