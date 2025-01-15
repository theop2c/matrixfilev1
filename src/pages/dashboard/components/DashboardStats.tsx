import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useFilesStore } from '@/store/files';
import { HardDrive, FileText, Clock, Upload, Grid, BarChart } from 'lucide-react';
import { formatBytes } from '@/lib/utils/format';
import { formatRelativeTime } from '@/lib/utils/date';
import { StorageUsageBar } from '@/components/dashboard/StorageUsageBar';
import { USER_MATRIX_LIMITS, USER_ANALYSE_LIMITS, USER_QUESTION_LIMITS } from '@/lib/constants';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { calculateTotalDiskUsage } from '@/lib/utils/storage';

const db = getFirestore();

export function DashboardStats() {
  const { user } = useAuthStore();
  const { files } = useFilesStore();
  const [uploadCount, setUploadCount] = useState(0);
  const [matrixCount, setMatrixCount] = useState(0);
  const [analysisCount, setAnalysisCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      // Fetch Matrix count
      const matrixQuery = query(
        collection(db, 'matrices'),
        where('userId', '==', user.id)
      );
      const matrixDocs = await getDocs(matrixQuery);
      setMatrixCount(matrixDocs.size);

      // Fetch Analysis count
      const analysisQuery = query(
        collection(db, 'matrices_analyses'),
        where('userId', '==', user.id)
      );
      const analysisDocs = await getDocs(analysisQuery);
      setAnalysisCount(analysisDocs.size);
    };

    fetchStats();
  }, [user]);

  useEffect(() => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentUploads = files.filter(f => new Date(f.dateTelechargement) > last24h);
    setUploadCount(recentUploads.length);
  }, [files]);

  if (!user) return null;

  const storageUsed = calculateTotalDiskUsage(files);
  const lastUpload = files[0]?.dateTelechargement;

  const matrixLimit = USER_MATRIX_LIMITS[user.role] || 0;
  const analysisLimit = USER_ANALYSE_LIMITS[user.role] || 0;
  const questionLimit = USER_QUESTION_LIMITS[user.role] || 0;

  return (
    <div className="space-y-6">
      <StorageUsageBar used={storageUsed} role={user.role} />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-green-500" />
            <h3 className="ml-2 text-sm font-medium text-gray-600">Total Files</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold">{files.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Upload className="w-6 h-6 text-purple-500" />
            <h3 className="ml-2 text-sm font-medium text-gray-600">Recent Uploads</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold">{uploadCount}</p>
          <p className="text-xs text-gray-500">In the last 24 hours</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-orange-500" />
            <h3 className="ml-2 text-sm font-medium text-gray-600">Last Upload</h3>
          </div>
          <p className="mt-2 text-lg font-semibold">
            {lastUpload ? formatRelativeTime(lastUpload) : 'No uploads yet'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Grid className="w-6 h-6 text-blue-500" />
            <h3 className="ml-2 text-sm font-medium text-gray-600">Matrices</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold">{matrixCount} / {matrixLimit}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <BarChart className="w-6 h-6 text-red-500" />
            <h3 className="ml-2 text-sm font-medium text-gray-600">Analyses</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold">{analysisCount} / {analysisLimit}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <HardDrive className="w-6 h-6 text-yellow-500" />
            <h3 className="ml-2 text-sm font-medium text-gray-600">Questions Per Matrix</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold">{questionLimit}</p>
        </div>
      </div>
    </div>
  );
}
