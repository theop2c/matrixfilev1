import { useAdminStore } from '@/store/admin';

export function TokenUsage() {
  const { users } = useAdminStore();
  
  const totalTokens = users.reduce((acc, user) => ({
    entree: acc.entree + user.jetonUtilises.entree,
    sortie: acc.sortie + user.jetonUtilises.sortie
  }), { entree: 0, sortie: 0 });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Utilisation des Jetons</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Jetons d'Entrée</p>
          <p className="text-2xl font-semibold">{totalTokens.entree.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Jetons de Sortie</p>
          <p className="text-2xl font-semibold">{totalTokens.sortie.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}