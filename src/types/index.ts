export interface Utilisateur {
  id: string;
  email: string;
  role: 'freemium' | 'premium' | 'gold';
  blocked?: boolean;
  stockageUtilise: number;
  nombreFichiers: number;
  derniereMiseAJour: Date;
  premiereConnexion: Date;
  derniereConnexion: Date;
  jetonUtilises: {
    entree: number;
    sortie: number;
  };
}