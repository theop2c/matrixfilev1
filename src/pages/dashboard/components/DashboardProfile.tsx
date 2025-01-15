import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Firebase initialization (ensure Firebase is initialized in your project)
const db = getFirestore();
const auth = getAuth();

const DashboardProfile: React.FC = () => {
  const [user, setUser] = useState<{ email: string; id: string; role: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({
            email: currentUser.email || '',
            id: currentUser.uid,
            role: userDoc.data().role || 'User',
          });
        }
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="mt-1 space-y-1">
              <p className="text-gray-600">Welcome, {user.email}</p>
              <p className="text-sm text-gray-500">ID: {user.id}</p>
              <p className="text-sm text-gray-500">Role: {user.role}</p>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProfile;
