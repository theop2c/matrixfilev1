import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { UsageStats } from './components/UsageStats';

export function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Manage your files and chat with AI</p>
          </div>

          <UsageStats />
          <FileUpload />
          <FileList />
        </div>
      </div>
    </div>
  );
}