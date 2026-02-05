import { useState } from 'react';

export interface JobFormData {
  title: string;
  description: string;
  budget: number;
  deadline: string;
  category: 'CODE' | 'CONTENT' | 'PHYSICAL' | 'OTHER';
  proofType: 'MANUAL' | 'CODE' | 'CONTENT' | 'PHOTO';
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
}

interface JobFormProps {
  onSubmit: (data: JobFormData) => void;
  isSubmitting?: boolean;
}

export function JobForm({ onSubmit, isSubmitting }: JobFormProps) {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    budget: 100,
    deadline: '',
    category: 'CODE',
    proofType: 'MANUAL',
  });

  const [showLocation, setShowLocation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const categories = [
    { value: 'CODE', label: '💻 Code', icon: '💻' },
    { value: 'CONTENT', label: '✍️ Content', icon: '✍️' },
    { value: 'PHYSICAL', label: '📍 Physical', icon: '📍' },
    { value: 'OTHER', label: '📋 Other', icon: '📋' },
  ];

  const proofTypes = [
    { value: 'MANUAL', label: 'Manual Review' },
    { value: 'CODE', label: 'Automated Tests' },
    { value: 'CONTENT', label: 'Plagiarism Check' },
    { value: 'PHOTO', label: 'Photo Verification' },
  ];

  // Set default deadline to 7 days from now
  const defaultDeadline = new Date();
  defaultDeadline.setDate(defaultDeadline.getDate() + 7);
  const defaultDeadlineStr = defaultDeadline.toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title
        </label>
        <input
          type="text"
          required
          minLength={3}
          maxLength={100}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Build a Solana escrow program"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          required
          minLength={10}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          placeholder="Describe what needs to be done..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget (USDC)
          </label>
          <input
            type="number"
            required
            min={1}
            step={0.01}
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deadline
          </label>
          <input
            type="datetime-local"
            required
            defaultValue={defaultDeadlineStr}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => {
              const category = e.target.value as JobFormData['category'];
              setFormData({ ...formData, category });
              setShowLocation(category === 'PHYSICAL');
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Type
          </label>
          <select
            value={formData.proofType}
            onChange={(e) => setFormData({ ...formData, proofType: e.target.value as JobFormData['proofType'] })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {proofTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showLocation && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <h4 className="font-medium text-gray-700">📍 Location Requirements</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                onChange={(e) => setFormData({
                  ...formData,
                  location: { ...formData.location, lat: parseFloat(e.target.value), lng: formData.location?.lng || 0, radius: formData.location?.radius || 100 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="1.3521"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                onChange={(e) => setFormData({
                  ...formData,
                  location: { ...formData.location, lng: parseFloat(e.target.value), lat: formData.location?.lat || 0, radius: formData.location?.radius || 100 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="103.8198"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Radius (m)</label>
              <input
                type="number"
                min={10}
                defaultValue={100}
                onChange={(e) => setFormData({
                  ...formData,
                  location: { ...formData.location, radius: parseInt(e.target.value), lat: formData.location?.lat || 0, lng: formData.location?.lng || 0 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Creating...' : 'Post Job'}
      </button>
    </form>
  );
}
