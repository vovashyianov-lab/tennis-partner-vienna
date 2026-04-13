import React, { useState, useEffect, useRef } from 'react';
import { SkillLevel, ViennaDistrict, PlayStyle, Gender } from '../types';
import { UserPlus2, Camera } from 'lucide-react';
import Modal from './modals/Modal';
import { useAuth } from '../hooks/useAuth';
import { resizeImage } from '../utils/imageUtils';

interface PlayerRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  prefillData?: Record<string, string> | null;
}

const VIENNA_DISTRICTS: ViennaDistrict[] = [
  '1. Innere Stadt', '2. Leopoldstadt', '3. Landstraße',
  '4. Wieden', '5. Margareten', '6. Mariahilf',
  '7. Neubau', '8. Josefstadt', '9. Alsergrund',
  '10. Favoriten', '11. Simmering', '12. Meidling',
  '13. Hietzing', '14. Penzing', '15. Rudolfsheim-Fünfhaus',
  '16. Ottakring', '17. Hernals', '18. Währing',
  '19. Döbling', '20. Brigittenau', '21. Floridsdorf',
  '22. Donaustadt', '23. Liesing'
];

const SKILL_LEVELS: { value: SkillLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Just starting out or returning to tennis' },
  { value: 'intermediate', label: 'Intermediate', description: 'Comfortable rallying, developing match play' },
  { value: 'advanced', label: 'Advanced', description: 'Strong technique, experienced in competition' },
  { value: 'tournament', label: 'Tournament', description: 'Active tournament player' },
];

const initialFormState = {
  name: '',
  phone: '',
  email: '',
  password: '',
  skillLevel: undefined as SkillLevel | undefined,
  district: undefined as ViennaDistrict | undefined,
  playStyle: 'both' as PlayStyle,
  gender: 'male' as Gender,
  avatar: undefined as string | undefined,
  bio: '',
  whatsappConsent: false,
};

export default function PlayerRegistration({ isOpen, onClose, onSwitchToLogin, prefillData }: PlayerRegistrationProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // progressive registration: 1→credentials, 2→profile, 3→preferences
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...initialFormState,
        ...(prefillData?.name  && { name: prefillData.name }),
        ...(prefillData?.email && { email: prefillData.email }),
        ...(prefillData?.phone && { phone: prefillData.phone }),
      });
      setError(null);
      setStep(1);
    }
  }, [isOpen]);

  const handleClose = () => {
    setFormData(initialFormState);
    setError(null);
    setStep(1);
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError('Image must be under 3MB');
      return;
    }
    try {
      const resizedImage = await resizeImage(file);
      setFormData({ ...formData, avatar: resizedImage });
    } catch {
      setError('Error processing image. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Step validation
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    // Step 3 — final submit
    setLoading(true);
    try {
      await signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        skill_level: formData.skillLevel,
        district: formData.district,
        play_style: formData.playStyle,
        gender: formData.gender,
        avatar: formData.avatar,
        bio: formData.bio,
        whatsapp_consent: formData.whatsappConsent,
      });
      setFormData(initialFormState);
      onClose();
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = ['Create Account', 'Your Profile', 'Preferences'];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={stepTitles[step - 1]}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s <= step
                  ? 'bg-tennis-600 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-tennis-600' : 'bg-gray-100'}`} />}
            </div>
          ))}
        </div>

        {/* ─── STEP 1: Credentials ─── */}
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tennis-400 focus:border-transparent"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Max Mustermann"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tennis-400 focus:border-transparent"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tennis-400 focus:border-transparent"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Phone</label>
              <input
                type="tel"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tennis-400 focus:border-transparent"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+43 660 1234567"
              />
              <p className="mt-1 text-xs text-gray-500">Used for match notifications (optional)</p>
            </div>
          </>
        )}

        {/* ─── STEP 2: Profile ─── */}
        {step === 2 && (
          <>
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className={`w-20 h-20 rounded-full overflow-hidden border-2 border-tennis-200 ${
                  formData.avatar ? 'bg-gray-100' : 'bg-tennis-50'
                }`}>
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-tennis-400">
                      <Camera className="w-7 h-7" />
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-sm text-tennis-600 hover:text-tennis-800 transition-colors"
                >
                  {formData.avatar ? 'Change photo' : 'Add photo'}
                </button>
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <div className="flex gap-4">
                {(['male', 'female', 'other'] as Gender[]).map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={formData.gender === g}
                      onChange={() => setFormData({ ...formData, gender: g })}
                      className="w-4 h-4 text-tennis-600 border-gray-300 focus:ring-tennis-400"
                    />
                    <span className="text-gray-700 capitalize">{g}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Skill Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
              <div className="grid grid-cols-2 gap-2">
                {SKILL_LEVELS.map(({ value, label, description }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, skillLevel: value })}
                    className={`p-3 rounded-xl border text-left transition-all active:scale-[0.98] ${
                      formData.skillLevel === value
                        ? 'border-tennis-500 bg-tennis-50 ring-2 ring-tennis-400'
                        : 'border-gray-200 hover:border-tennis-300'
                    }`}
                  >
                    <span className="font-medium text-sm">{label}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio (optional)</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tennis-400 focus:border-transparent resize-none"
                rows={2}
                maxLength={160}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="e.g. Love clay courts, available weekends"
              />
            </div>
          </>
        )}

        {/* ─── STEP 3: Preferences ─── */}
        {step === 3 && (
          <>
            {/* Vienna District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your District</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tennis-400 focus:border-transparent"
                value={formData.district || ''}
                onChange={(e) => setFormData({ ...formData, district: e.target.value as ViennaDistrict || undefined })}
              >
                <option value="">Select your district</option>
                {VIENNA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Play Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Play Style</label>
              <div className="flex gap-3">
                {([
                  { value: 'singles', label: 'Singles' },
                  { value: 'doubles', label: 'Doubles' },
                  { value: 'both', label: 'Both' },
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, playStyle: value })}
                    className={`flex-1 py-2.5 rounded-xl border font-medium text-sm transition-all active:scale-[0.98] ${
                      formData.playStyle === value
                        ? 'border-tennis-500 bg-tennis-50 text-tennis-800 ring-2 ring-tennis-400'
                        : 'border-gray-200 text-gray-600 hover:border-tennis-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp consent */}
            <div className="p-4 bg-tennis-50 rounded-xl border border-tennis-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.whatsappConsent}
                  onChange={(e) => setFormData({ ...formData, whatsappConsent: e.target.checked })}
                  className="w-5 h-5 mt-0.5 text-tennis-600 border-gray-300 rounded focus:ring-tennis-400"
                />
                <div>
                  <span className="font-medium text-sm text-tennis-900">Notify me via WhatsApp</span>
                  <p className="text-xs text-tennis-700 mt-0.5">
                    Get notified when a matching partner is found in your district and skill level.
                    You can unsubscribe at any time.
                  </p>
                </div>
              </label>
            </div>
          </>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-150 text-sm font-medium"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-tennis-600 text-white py-2.5 px-4 rounded-xl hover:bg-tennis-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? 'Creating account...' : step < 3 ? 'Continue' : 'Create Account'}
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-tennis-600 hover:text-tennis-800 text-sm transition-colors"
          >
            Already have an account? Log in
          </button>
        </div>
      </form>
    </Modal>
  );
}
