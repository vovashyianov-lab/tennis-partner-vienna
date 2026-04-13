import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, MapPin, Phone, CheckCircle, XCircle, Search } from 'lucide-react';
import { Location, Player } from '../../types';
import LocationForm from './LocationForm';
import Modal from '../modals/Modal';
import UsersList from './UsersList';
import { supabase } from '../../lib/supabase';

interface AdminPanelProps {
  locations: Location[];
  games: any[];
  availabilities: any[];
  onAddLocation: (location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onEditLocation: (id: string, data: Partial<Location>) => Promise<void>;
  onDeleteLocation: (id: string) => void;
  onDeleteGame: (id: string) => Promise<void>;
  onDeleteAvailability: (id: string) => Promise<void>;
  onBlockUser: (userId: string) => Promise<void>;
  onUnblockUser: (userId: string) => Promise<void>;
  onClose: () => void;
}

export default function AdminPanel({
  locations,
  onAddLocation,
  onEditLocation,
  onDeleteLocation,
  onBlockUser,
  onUnblockUser,
}: AdminPanelProps) {
  const [activeTab, setActiveTab]             = useState<'locations' | 'users'>('locations');
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation]   = useState<Location | null>(null);
  const [deleteConfirm, setDeleteConfirm]       = useState<{ id: string; name: string } | null>(null);
  const [locationFilter, setLocationFilter]     = useState('');
  const [users, setUsers]                       = useState<Player[]>([]);

  useEffect(() => {
    supabase.from('profiles').select('*').then(({ data }) => {
      if (data) setUsers(data);
    });
  }, []);

  const filtered = locations.filter(l =>
    l.name.toLowerCase().includes(locationFilter.toLowerCase()) ||
    l.address.toLowerCase().includes(locationFilter.toLowerCase())
  );

  const tabs: { key: 'locations' | 'users'; label: string; count: number }[] = [
    { key: 'locations', label: 'Clubs',   count: locations.length },
    { key: 'users',     label: 'Players', count: users.length },
  ];

  return (
    <div className="space-y-5">

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === t.key
                ? 'border-tennis-500 text-tennis-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label} <span className="ml-1 text-xs opacity-60">({t.count})</span>
          </button>
        ))}
      </div>

      {/* ── Locations tab ── */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clubs…"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tennis-400"
              />
            </div>
            <button
              onClick={() => setShowLocationForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-tennis-600 text-white rounded-xl text-sm font-medium hover:bg-tennis-700 active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              Add club
            </button>
          </div>

          <div className="space-y-2">
            {filtered.map(loc => (
              <div key={loc.id} className="flex justify-between items-start p-4 bg-white rounded-xl border border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 text-sm">{loc.name}</p>
                    {loc.active
                      ? <span className="flex items-center gap-0.5 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" />Active</span>
                      : <span className="flex items-center gap-0.5 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" />Inactive</span>
                    }
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-tennis-600 transition-colors"
                  >
                    <MapPin className="w-3 h-3" />{loc.address}
                  </a>
                  {loc.phone && (
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone className="w-3 h-3" />{loc.phone}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0 ml-3">
                  <button
                    onClick={() => setEditingLocation(loc)}
                    className="p-1.5 text-gray-400 hover:text-tennis-600 hover:bg-tennis-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ id: loc.id, name: loc.name })}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-center py-8 text-sm text-gray-400">
                {locationFilter ? 'No clubs match your search' : 'No clubs added yet'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Users tab ── */}
      {activeTab === 'users' && (
        <UsersList
          users={users}
          onBlockUser={onBlockUser}
          onUnblockUser={onUnblockUser}
        />
      )}

      {/* Location form modal */}
      {(showLocationForm || editingLocation) && (
        <LocationForm
          isOpen
          onClose={() => { setShowLocationForm(false); setEditingLocation(null); }}
          onSubmit={(data) => {
            if (editingLocation) onEditLocation(editingLocation.id, data);
            else onAddLocation(data);
            setShowLocationForm(false);
            setEditingLocation(null);
          }}
          initialData={editingLocation}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <Modal isOpen onClose={() => setDeleteConfirm(null)} title="Delete club">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                Cancel
              </button>
              <button
                onClick={() => { onDeleteLocation(deleteConfirm.id); setDeleteConfirm(null); }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
