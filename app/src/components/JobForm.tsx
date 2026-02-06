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
    { value: 'CODE', label: 'Code', icon: '{}' },
    { value: 'CONTENT', label: 'Content', icon: 'Aa' },
    { value: 'PHYSICAL', label: 'Physical', icon: '' },
    { value: 'OTHER', label: 'Other', icon: '?' },
  ];

  const proofTypes = [
    { value: 'MANUAL', label: 'Manual Review', description: 'You review and approve work manually' },
    { value: 'CODE', label: 'Automated Tests', description: 'Tests must pass to auto-approve' },
    { value: 'CONTENT', label: 'Plagiarism Check', description: 'Originality verified automatically' },
    { value: 'PHOTO', label: 'Photo Verification', description: 'GPS and timestamp verification' },
  ];

  // Set default deadline to 7 days from now
  const defaultDeadline = new Date();
  defaultDeadline.setDate(defaultDeadline.getDate() + 7);
  const defaultDeadlineStr = defaultDeadline.toISOString().slice(0, 16);

  const workerPayout = formData.budget * 0.95;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-white/60 mb-2">
          Job Title
        </label>
        <input
          type="text"
          required
          minLength={3}
          maxLength={100}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#6B4EE6]/50 focus:ring-1 focus:ring-[#6B4EE6]/50 transition-colors"
          placeholder="e.g., Build a Solana escrow program"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-white/60 mb-2">
          Description
        </label>
        <textarea
          required
          minLength={10}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#6B4EE6]/50 focus:ring-1 focus:ring-[#6B4EE6]/50 transition-colors resize-none"
          rows={5}
          placeholder="Describe what needs to be done in detail..."
        />
      </div>

      {/* Budget and Deadline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">
            Budget (USDC)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
            <input
              type="number"
              required
              min={1}
              step={0.01}
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
              className="w-full pl-8 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#6B4EE6]/50 focus:ring-1 focus:ring-[#6B4EE6]/50 transition-colors"
            />
          </div>
          <p className="text-xs text-white/40 mt-1">
            Worker receives ${workerPayout.toFixed(2)} (95%)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">
            Deadline
          </label>
          <input
            type="datetime-local"
            required
            defaultValue={defaultDeadlineStr}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white focus:outline-none focus:border-[#6B4EE6]/50 focus:ring-1 focus:ring-[#6B4EE6]/50 transition-colors [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-white/60 mb-3">
          Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                const category = cat.value as JobFormData['category'];
                setFormData({ ...formData, category });
                setShowLocation(category === 'PHYSICAL');
              }}
              className={`p-4 rounded-xl border transition-all text-left ${
                formData.category === cat.value
                  ? 'bg-[#6B4EE6]/10 border-[#6B4EE6]/50 text-white'
                  : 'bg-white/[0.02] border-white/[0.06] text-white/60 hover:border-white/[0.12]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6B4EE6]/20 to-[#2DD4BF]/20 flex items-center justify-center mb-2 text-sm font-mono">
                {cat.icon}
              </div>
              <span className="font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Proof Type */}
      <div>
        <label className="block text-sm font-medium text-white/60 mb-3">
          Verification Method
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {proofTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData({ ...formData, proofType: type.value as JobFormData['proofType'] })}
              className={`p-4 rounded-xl border transition-all text-left ${
                formData.proofType === type.value
                  ? 'bg-[#6B4EE6]/10 border-[#6B4EE6]/50'
                  : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  formData.proofType === type.value ? 'border-[#6B4EE6]' : 'border-white/30'
                }`}>
                  {formData.proofType === type.value && (
                    <div className="w-2 h-2 rounded-full bg-[#6B4EE6]" />
                  )}
                </div>
                <span className="font-medium text-white">{type.label}</span>
              </div>
              <p className="text-xs text-white/40 ml-6">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Location for Physical Jobs */}
      {showLocation && (
        <div className="p-5 bg-amber-500/5 rounded-xl border border-amber-500/20 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h4 className="font-medium text-amber-400">Location Requirements</h4>
          </div>
          <p className="text-sm text-white/50">
            Worker must upload a photo taken within the specified radius of these coordinates.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                onChange={(e) => setFormData({
                  ...formData,
                  location: { ...formData.location, lat: parseFloat(e.target.value), lng: formData.location?.lng || 0, radius: formData.location?.radius || 100 }
                })}
                className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
                placeholder="1.3521"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                onChange={(e) => setFormData({
                  ...formData,
                  location: { ...formData.location, lng: parseFloat(e.target.value), lat: formData.location?.lat || 0, radius: formData.location?.radius || 100 }
                })}
                className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
                placeholder="103.8198"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Radius (meters)</label>
              <input
                type="number"
                min={10}
                defaultValue={100}
                onChange={(e) => setFormData({
                  ...formData,
                  location: { ...formData.location, radius: parseInt(e.target.value), lat: formData.location?.lat || 0, lng: formData.location?.lng || 0 }
                })}
                className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6B4EE6] to-[#5B3FD6] hover:from-[#7B5EF6] hover:to-[#6B4EE6] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#6B4EE6]/25"
      >
        {isSubmitting ? 'Creating Job...' : 'Post Job'}
      </button>
    </form>
  );
}
