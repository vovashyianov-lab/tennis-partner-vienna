import React, { useState, useEffect, useRef } from 'react';
import { Camera, LogOut, Trash2 } from 'lucide-react';
import Modal from './modals/Modal';
import { useAuth } from '../hooks/useAuth';
import { resizeImage } from '../utils/imageUtils';
import { SkillLevel, ViennaDistrict, PlayStyle, Gender } from '../types';

const VIENNA_DISTRICTS: ViennaDistrict[] = [
  '1. Innere Stadt', '2. Leopoldstadt', '3. Landstraße',
  '4. Wieden', '5. Margareten', '6. Mariahilf',
  '7. Neubau', '8. Josefstadt', '9. Alsergrund',
  '10. Favoriten', '11. Simmering', '12. Meidling',
  '13. Hietzing', '14. Penzing', '15. Rudolfsheim-Fünfhaus',
  '16. Ottakring', '17. Hernals', '18. Währing',
  '19. Döbling', '20. Brigittenau', '21. Floridsdorf',
  '22. Donaustadt', '23. Liesing',
];

const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: 'beginner',     label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced',     label: 'Advanced' },
  { value: 'tournament',   label: 'Tournament' },
];

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfilePanel({ isOpen, onClose, onLogout }: ProfilePanelProps) {
  const { user, updateProfile, deleteAccount } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    skill_level: '' as SkillLevel | '',
    district: '' as ViennaDistrict | '',
    play_style: 'both' as PlayStyle,
    gender: 'other' as Gender,
    avatar: undefined as string | undefined,
    whatsapp_consent: false,
  });
  const [saving, setSaving]                 = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [success, setSuccess]               = useState(false);
  const [confirmDelete, setConfirmDelete]   = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setForm({
        name:              user.name ?? '',
        phone:             user.phone ?? '',
        bio:               user.bio ?? '',
        skill_level:       user.skill_level ?? '',
        district:          user.district ?? '',
        play_style:        user.play_style ?? 'both',
        gender:            user.gender ?? 'other',
        avatar:            user.avatar ?? undefined,
        whatsapp_consent:  user.whatsapp_consent ?? false,
      });
      setError(null);
      setSuccess(false);
      setConfirmDelete(false);
    }
  }, [user, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setError('Image must be under 3MB'); return; }
    try {
      const resized = await resizeImage(file);
      setForm(f => ({ ...f, avatar: resized }));
    } catch {
      setError('Error processing image.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        name:             form.name,
        phone:            form.phone,
        bio:              form.bio,
        skill_level:      form.skill_level || undefined,
        district:         form.district    || undefined,
        play_style:       form.play_style,
        gender:           form.gender,
        avatar:           form.avatar,
        whatsapp_consent: form.whatsapp_consent,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting account.');
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your profile">
      <form onSubmit={handleSave} className="space-y-5">

        {error   && <div className="px-4 py-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">{error}</div>}
        {success && <div className="px-4 py-3 bg-tennis-50 border border-tennis-100 text-tennis-700 rounded-xl text-sm">Profile saved.</div>}

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {form.avatar ? (
              <img src={form.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover ring-2 ring-tennis-200" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-tennis-100 flex items-center justify-center ring-2 ring-tennis-200">
                <span className="text-2xl font-bold text-tennis-400">{user.name?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-tennis-600 text-white rounded-full flex items-center justify-center hover:bg-tennis-700 transition-colors"
              title="Change photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Full name</label>
          <input
            type="text" required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tennis-400"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">WhatsApp phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+43 660 1234567"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tennis-400"
          />
        </div>

        {/* Two-column row: Skill + District */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Skill level</label>
            <select
              value={form.skill_level}
              onChange={e => setForm(f => ({ ...f, skill_level: e.target.value as SkillLevel }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tennis-400 bg-white"
            >
              <option value="">— select —</option>
              {SKILL_LEVELS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">District</label>
            <select
              value={form.district}
              onChange={e => setForm(f => ({ ...f, district: e.target.value as ViennaDistrict }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tennis-400 bg-white"
            >
              <option value="">— select —</option>
              {VIENNA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Play style */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Play style</label>
          <div className="flex gap-2">
            {(['singles','doubles','both'] as PlayStyle[]).map(s => (
              <button
                key={s} type="button"
                onClick={() => setForm(f => ({ ...f, play_style: s }))}
                className={`flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-all active:scale-[0.98] ${
                  form.play_style === s
                    ? 'border-tennis-500 bg-tennis-50 text-tennis-800 ring-2 ring-tennis-400'
                    : 'border-gray-200 text-gray-600 hover:border-tennis-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Bio <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea
            rows={2}
            maxLength={160}
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="e.g. Love clay courts, available weekends"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tennis-400 resize-none"
          />
        </div>

        {/* WhatsApp consent */}
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-tennis-50 border border-tennis-100">
          <input
            type="checkbox"
            checked={form.whatsapp_consent}
            onChange={e => setForm(f => ({ ...f, whatsapp_consent: e.target.checked }))}
            className="mt-0.5 w-4 h-4 text-tennis-600 rounded focus:ring-tennis-400"
          />
          <div>
            <p className="text-sm font-medium text-tennis-900">Show WhatsApp button on my profile</p>
            <p className="text-xs text-tennis-600 mt-0.5">Other players will see a WhatsApp button linking to your number</p>
          </div>
        </label>

        {/* Save */}
        <button
          type="submit" disabled={saving}
          className="w-full bg-tennis-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-tennis-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save profile'}
        </button>

        {/* Bottom actions */}
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => { onLogout(); onClose(); }}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">Are you sure?</span>
              <button type="button" onClick={handleDeleteAccount} className="text-xs font-medium text-red-600 hover:text-red-800">Yes, delete</button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="text-xs text-gray-500">Cancel</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete account
            </button>
          )}
        </div>

      </form>
    </Modal>
  );
}
