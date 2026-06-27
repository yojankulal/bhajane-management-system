import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Phone, 
  MapPin, 
  StickyNote, 
  Check, 
  X, 
  User, 
  Home, 
  Ban, 
  AlertTriangle 
} from 'lucide-react';
import { House } from '../types';
import { Language, translations } from '../utils/translations';

interface HouseManagementProps {
  houses: House[];
  isAdmin: boolean;
  onAddHouse: (house: Omit<House, 'id'>) => Promise<void>;
  onUpdateHouse: (id: string, updates: Partial<House>) => Promise<void>;
  onDeleteHouse: (id: string) => Promise<void>;
  language?: Language;
}

export default function HouseManagement({
  houses,
  isAdmin,
  onAddHouse,
  onUpdateHouse,
  onDeleteHouse,
  language = 'en'
}: HouseManagementProps) {
  const t = translations[language];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Drawer / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  
  // Form fields
  const [houseId, setHouseId] = useState('');
  const [familyHeadName, setFamilyHeadName] = useState('');
  const [houseName, setHouseName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Validation / Error state
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete confirm dialog
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Open Form for Adding
  const openAddForm = () => {
    setEditingHouse(null);
    // Find next suggested house ID
    const nextSeq = houses.length + 1;
    const formattedSeq = nextSeq < 10 ? `0${nextSeq}` : `${nextSeq}`;
    setHouseId(`H-${formattedSeq}`);
    setFamilyHeadName('');
    setHouseName('');
    setPhone('');
    setAddress('');
    setNotes('');
    setIsActive(true);
    setFormError('');
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const openEditForm = (house: House) => {
    setEditingHouse(house);
    setHouseId(house.houseId);
    setFamilyHeadName(house.familyHeadName);
    setHouseName(house.houseName);
    setPhone(house.phone || '');
    setAddress(house.address || '');
    setNotes(house.notes || '');
    setIsActive(house.isActive);
    setFormError('');
    setIsFormOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setFormError('Action forbidden: You must sign in with Google to manage houses.');
      return;
    }

    if (!houseId.trim()) {
      setFormError('House ID is required.');
      return;
    }
    if (!familyHeadName.trim()) {
      setFormError('Family Head Name is required.');
      return;
    }
    if (!houseName.trim()) {
      setFormError('House Name is required.');
      return;
    }

    // Check if HouseId is unique (excluding currently edited house)
    const duplicate = houses.find(
      h => h.houseId.toLowerCase().trim() === houseId.toLowerCase().trim() && h.id !== editingHouse?.id
    );
    if (duplicate) {
      setFormError(`A house with ID "${houseId}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingHouse) {
        // Edit flow
        await onUpdateHouse(editingHouse.id, {
          houseId: houseId.trim(),
          familyHeadName: familyHeadName.trim(),
          houseName: houseName.trim(),
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
          isActive
        });
      } else {
        // Add flow
        await onAddHouse({
          houseId: houseId.trim(),
          familyHeadName: familyHeadName.trim(),
          houseName: houseName.trim(),
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
          isActive
        });
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Error occurred while saving house.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleConfirmDelete = async (id: string) => {
    if (!isAdmin) return;
    try {
      await onDeleteHouse(id);
      setConfirmDeleteId(null);
    } catch (err) {
      alert('Failed to delete house.');
    }
  };

  // Filtering & Searching Logic
  const filteredHouses = houses.filter(house => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      house.familyHeadName.toLowerCase().includes(term) ||
      house.houseName.toLowerCase().includes(term) ||
      house.houseId.toLowerCase().includes(term) ||
      (house.phone && house.phone.includes(term)) ||
      (house.address && house.address.toLowerCase().includes(term));
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && house.isActive) || 
      (statusFilter === 'inactive' && !house.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Module Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">{t.housesTitle}</h2>
          <p className="text-xs text-zinc-500">{t.housesSubtitle}</p>
        </div>
        
        {isAdmin && (
          <button
            id="btn-add-house"
            onClick={openAddForm}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wide shadow transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addHouse}</span>
          </button>
        )}
      </div>

      {/* Control Actions (Search & Filter) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
        
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
          <input
            id="search-houses"
            type="text"
            placeholder={t.searchHousesPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-transparent dark:border-zinc-700 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-300 focus:outline-none transition-all text-zinc-800 dark:text-zinc-200"
          />
        </div>

        <div className="flex gap-1 bg-zinc-50 dark:bg-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 text-[11px] font-bold uppercase transition py-1 rounded-lg ${
              statusFilter === 'all' 
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            All ({houses.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`flex-1 text-[11px] font-bold uppercase transition py-1 rounded-lg ${
              statusFilter === 'active' 
                ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Active ({houses.filter(h=>h.isActive).length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`flex-1 text-[11px] font-bold uppercase transition py-1 rounded-lg ${
              statusFilter === 'inactive' 
                ? 'bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Inactive ({houses.filter(h=>!h.isActive).length})
          </button>
        </div>

      </div>

      {/* Register List - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHouses.map((house) => (
          <div 
            key={house.id} 
            className={`bg-white dark:bg-zinc-900 rounded-2xl border p-5 shadow-sm space-y-4 hover:shadow-md transition-all duration-200 ${
              house.isActive 
                ? 'border-zinc-100 dark:border-zinc-800/80' 
                : 'border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30'
            }`}
          >
            
            {/* House Identity Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px] font-extrabold text-zinc-600 dark:text-zinc-400">
                  {house.houseId}
                </span>
                <h3 className="text-sm font-extrabold text-zinc-800 dark:text-white leading-snug">
                  {house.familyHeadName}
                </h3>
                <p className="text-[11px] text-zinc-500 font-medium">
                  🏡 {house.houseName}
                </p>
              </div>

              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                house.isActive 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-805 dark:text-zinc-500'
              }`}>
                {house.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Quick Details fields */}
            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300 pt-1">
              {house.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <a href={`tel:${house.phone}`} className="hover:underline font-mono">{house.phone}</a>
                </div>
              )}
              {house.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                  <span className="leading-snug">{house.address}</span>
                </div>
              )}
              {house.notes && (
                <div className="flex items-start gap-2 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <StickyNote className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-zinc-500">{house.notes}</span>
                </div>
              )}
            </div>

            {/* Admin Management Action Row */}
            {isAdmin && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                <button
                  onClick={() => openEditForm(house)}
                  className="flex items-center gap-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 p-1.5 px-3 rounded-lg text-xs font-semibold select-none transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setConfirmDeleteId(house.id)}
                  className="flex items-center gap-1 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 text-zinc-400 p-1.5 px-3 rounded-lg text-xs font-semibold select-none transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}

            {/* In-card Delete Confirmation */}
            {confirmDeleteId === house.id && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 text-xs text-red-800 dark:text-red-300 space-y-2">
                <p className="flex items-center gap-1 bg-red-105/10 p-1 rounded font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>Are you sure you want to delete this house profile? This will break history linkages.</span>
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="p-1 px-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmDelete(house.id)}
                    className="p-1 px-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}

          </div>
        ))}

        {filteredHouses.length === 0 && (
          <div className="md:col-span-3 text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 space-y-2">
            <Search className="w-8 h-8 mx-auto" />
            <p className="font-semibold text-sm">No houses match your search query or filters.</p>
            <p className="text-xs">Try adjusting your keyword terms or status selections.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Slider Form Dialog Drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/50 backdrop-blur-xs">
          
          <div 
            onClick={() => setIsFormOpen(false)} 
            className="absolute inset-0"
          />

          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col p-6 space-y-6 animate-slide-in overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h3 className="text-md font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                {editingHouse ? `Edit House Profile` : 'Register New House'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 flex-1">
              
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">House ID *</label>
                <input
                  type="text"
                  placeholder="e.g. H-01"
                  value={houseId}
                  onChange={(e) => setHouseId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Family Head Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Manjunatha Hegde"
                  value={familyHeadName}
                  onChange={(e) => setFamilyHeadName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">House Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Srinivasa Kripa"
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9845012345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Detailed Address (Optional)</label>
                <textarea
                  placeholder="e.g. Near Old Banyan Tree, Kairangala"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Privately Logged Notes (Optional)</label>
                <textarea
                  placeholder="e.g. Bhajan singer, is willing to host upcoming Saturday priests"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-650 bg-gray-100 border-gray-300 focus:ring-0"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  Mark as Active register profile
                </label>
              </div>

              {formError && (
                <div className="p-3 bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-300 text-xs rounded-lg font-bold">
                  {formError}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-600 dark:text-zinc-300 text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 font-bold text-xs uppercase"
                >
                  {isSubmitting ? 'Saving...' : 'Save House'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
