const QUOTAS = {
  gratuit: {
    stockage: '5 Mo',
    fichiers: '10 fichiers',
    description: 'Plan gratuit de base'
  },
  premium: {
    stockage: '20 Mo',
    fichiers: '50 fichiers',
    description: 'Plan premium avec plus de stockage'
  },
  or: {
    stockage: '50 Mo',
    fichiers: '100 fichiers',
    description: 'Plan or avec stockage maximal'
  }
};

export function UserQuotas() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Quotas Utilisateurs</h2>
      <div className="space-y-4">
        {Object.entries(QUOTAS).map(([plan, quota]) => (
          <div key={plan} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium capitalize">{plan}</p>
              <p className="text-sm text-gray-500">
                {quota.stockage}, {quota.fichiers}
              </p>
              <p className="text-xs text-gray-400">{quota.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}