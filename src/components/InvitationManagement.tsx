import React, { useState } from 'react';
import { 
  Mail, 
  Search, 
  HelpCircle, 
  Plus, 
  CheckCircle, 
  Clock, 
  Send, 
  Calendar, 
  RefreshCw, 
  User, 
  AlertCircle,
  XCircle,
  Trash2,
  UserPlus,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Award
} from 'lucide-react';
import { House, Invitation, InvitationStatus, BhajaneEvent, BillingRecord } from '../types';
import { Language, translations } from '../utils/translations';

interface InvitationManagementProps {
  houses: House[];
  invitations: Invitation[];
  events: BhajaneEvent[];
  billingRecords: BillingRecord[];
  isAdmin: boolean;
  onSetInvitationStatus: (house: House, eventId: string, status: InvitationStatus, notes?: string) => Promise<void>;
  onDeleteInvitation: (eventId: string, houseId: string) => Promise<void>;
  language?: Language;
}

export default function InvitationManagement({
  houses,
  invitations,
  events,
  billingRecords,
  isAdmin,
  onSetInvitationStatus,
  onDeleteInvitation,
  language = 'en'
}: InvitationManagementProps) {
  const t = translations[language];

  // Default target date estimation (upcoming Saturday)
  const getNextSaturdayStr = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (6 - day + 7) % 7;
    const daysToWait = diff === 0 ? 7 : diff;
    d.setDate(d.getDate() + daysToWait);
    return d.toISOString().split('T')[0];
  };

  const [targetEventDate, setTargetEventDate] = useState(getNextSaturdayStr());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'invited' | 'confirmed' | 'none'>('all');
  const [showAllHouses, setShowAllHouses] = useState(false);
  const [addingHouseId, setAddingHouseId] = useState('');
  
  // Track updating states
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const activeHouses = houses.filter(h => h.isActive);

  // Helper: Find previous sponsorship date of any house (using billing, events, and invitations)
  const getSponsorshipHistoryOfHouse = (houseId: string) => {
    const billEventsDesc = [...billingRecords]
      .filter(br => br.date < targetEventDate && br.sponsors.some(s => s.houseId === houseId))
      .sort((a, b) => b.date.localeCompare(a.date));

    const sortedPastEvents = [...events]
      .filter(e => e.date < targetEventDate && e.sponsors.includes(houseId))
      .sort((a, b) => b.date.localeCompare(a.date));

    const sortedPastInvs = [...invitations]
      .filter(inv => inv.eventId < targetEventDate && inv.houseId === houseId && inv.status !== 'cancelled')
      .sort((a, b) => b.eventId.localeCompare(a.eventId));

    const dates = [
      billEventsDesc[0]?.date,
      sortedPastEvents[0]?.date,
      sortedPastInvs[0]?.eventId
    ].filter(Boolean) as string[];

    if (dates.length > 0) {
      return dates.sort((a, b) => b.localeCompare(a))[0];
    }

    return 'Never Sponsored';
  };

  // Helper: Get invitation status for current target date
  const getInvitationForHouse = (houseId: string) => {
    return invitations.find(
      inv => inv.eventId === targetEventDate && inv.houseId === houseId
    );
  };

  // Handler to update or set invitation status
  const handleStatusChange = async (house: House, newStatus: InvitationStatus) => {
    if (!isAdmin) {
      alert('Forbidden: Authenticate with Google to update invitation logs.');
      return;
    }

    const inv = getInvitationForHouse(house.houseId);
    const key = `${targetEventDate}_${house.houseId}`;
    setUpdatingId(key);

    try {
      await onSetInvitationStatus(
        house,
        targetEventDate,
        newStatus,
        inv?.notes || ''
      );
    } catch (err) {
      console.error('Failed to change invitation status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleNotesChange = async (house: House, notes: string) => {
    if (!isAdmin) return;
    const inv = getInvitationForHouse(house.houseId);
    try {
      await onSetInvitationStatus(
        house,
        targetEventDate,
        inv?.status || 'pending',
        notes
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInvitationClick = async (houseId: string) => {
    if (!isAdmin) return;
    try {
      await onDeleteInvitation(targetEventDate, houseId);
    } catch (err) {
      console.error('Failed to delete invitation', err);
    }
  };

  // Sorts active houses by numeric houseId smoothly
  const getSortedActiveHouses = () => {
    return [...houses]
      .filter(h => h.isActive)
      .sort((a, b) => {
        const aNum = parseInt(a.houseId.replace(/\D/g, ''), 10);
        const bNum = parseInt(b.houseId.replace(/\D/g, ''), 10);
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        return a.houseId.localeCompare(b.houseId);
      });
  };

  // Systematic rotation calculations using both invitations and billing records
  const getLastSponsoredHouseId = (): string => {
    const activeHouseIds = new Set(activeHouses.map(h => h.houseId));
    const datesMap: { [date: string]: string[] } = {};

    // 1. Gather from billingRecords
    billingRecords.forEach(br => {
      if (br.date >= targetEventDate) return;
      if (!datesMap[br.date]) datesMap[br.date] = [];
      br.sponsors.forEach(s => {
        if (s.houseId && !s.houseId.startsWith('EXT_') && activeHouseIds.has(s.houseId)) {
          if (!datesMap[br.date].includes(s.houseId)) {
            datesMap[br.date].push(s.houseId);
          }
        }
      });
    });

    // 2. Gather from invitations (as fallback or additional tracking)
    invitations.forEach(inv => {
      if (inv.eventId >= targetEventDate || inv.status === 'cancelled') return;
      if (!datesMap[inv.eventId]) datesMap[inv.eventId] = [];
      if (activeHouseIds.has(inv.houseId)) {
        if (!datesMap[inv.eventId].includes(inv.houseId)) {
          datesMap[inv.eventId].push(inv.houseId);
        }
      }
    });

    // 3. Gather from events
    events.forEach(e => {
      if (e.date >= targetEventDate) return;
      if (!datesMap[e.date]) datesMap[e.date] = [];
      (e.sponsors || []).forEach(sponsorId => {
        const houseId = houses.find(h => h.id === sponsorId || h.houseId === sponsorId)?.houseId || sponsorId;
        if (activeHouseIds.has(houseId)) {
          if (!datesMap[e.date].includes(houseId)) {
            datesMap[e.date].push(houseId);
          }
        }
      });
    });

    // Sort prior dates desc
    const sortedDates = Object.keys(datesMap).sort((a, b) => b.localeCompare(a));
    if (sortedDates.length === 0) return '';

    const latestDate = sortedDates[0];
    const latestSponsors = datesMap[latestDate];
    if (latestSponsors.length === 0) return '';
    return latestSponsors[latestSponsors.length - 1]; // last sponsor in sequence that day
  };

  // Combined slots generation:
  // Fills up to 3 slots with existing invitations.
  // If fewer than 3 invitations exist, fills them up sequentially using systematic rotation.
  const getSponsoringSlots = () => {
    const slots: Array<{
      house: House;
      invitation?: Invitation;
      isSuggested: boolean;
    }> = [];

    // Find saved invitations for this target day (excluding cancelled)
    const savedInvsOnDay = invitations.filter(
      inv => inv.eventId === targetEventDate && inv.status !== 'cancelled'
    );

    const accountedHouseIds = new Set<string>();

    // 1. Populate saved invitations
    savedInvsOnDay.forEach(inv => {
      const house = houses.find(h => h.houseId === inv.houseId);
      if (house) {
        slots.push({
          house,
          invitation: inv,
          isSuggested: false
        });
        accountedHouseIds.add(house.houseId);
      }
    });

    // 2. Supplement remaining empty slots with the sequence recommendations
    const sortedHouses = getSortedActiveHouses();
    if (sortedHouses.length > 0) {
      const lastSponsoredId = getLastSponsoredHouseId();
      let startIndex = 0;
      if (lastSponsoredId) {
        const idx = sortedHouses.findIndex(h => h.houseId === lastSponsoredId);
        if (idx !== -1) {
          startIndex = (idx + 1) % sortedHouses.length;
        }
      }

      let currentIdx = startIndex;
      let iterations = 0;
      while (slots.length < 3 && iterations < sortedHouses.length) {
        const h = sortedHouses[currentIdx];
        if (!accountedHouseIds.has(h.houseId)) {
          slots.push({
            house: h,
            isSuggested: true
          });
          accountedHouseIds.add(h.houseId);
        }
        currentIdx = (currentIdx + 1) % sortedHouses.length;
        iterations++;
      }
    }

    return slots;
  };

  const currentSlots = getSponsoringSlots();

  // Remaining active houses that are NOT in the active 3 slots
  const uninvitedActiveHouses = activeHouses.filter(
    h => !currentSlots.some(s => s.house.houseId === h.houseId)
  );

  const processedAllHouses = activeHouses.map(house => {
    const inv = getInvitationForHouse(house.houseId);
    const lastSponsored = getSponsorshipHistoryOfHouse(house.houseId);
    return {
      ...house,
      invitation: inv,
      lastSponsored
    };
  });

  const filteredAllHouses = processedAllHouses.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      item.familyHeadName.toLowerCase().includes(term) ||
      item.houseName.toLowerCase().includes(term) ||
      item.houseId.toLowerCase().includes(term);

    const invStatus = item.invitation?.status || 'none';
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'none' && !item.invitation) ||
      (statusFilter === 'pending' && invStatus === 'pending') ||
      (statusFilter === 'invited' && invStatus === 'invited') ||
      (statusFilter === 'confirmed' && invStatus === 'confirmed');

    return matchesSearch && matchesStatus;
  });

  const handleManualAddHouse = async (houseId: string) => {
    if (!houseId || !isAdmin) return;
    const targetHouse = houses.find(h => h.houseId === houseId);
    if (!targetHouse) return;

    try {
      await onSetInvitationStatus(targetHouse, targetEventDate, 'pending');
      setAddingHouseId('');
    } catch (err) {
      console.error('Failed manual add', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-955/25 text-orange-650 dark:text-orange-400 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-zinc-800 dark:text-white">{t.invitationsTitle}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium font-sans">{t.invitationsSubtitle}</p>
          </div>
        </div>

        {/* Target Saturday Date Selection */}
        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800/80 p-2.5 px-4 rounded-xl">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{language === 'kn' ? 'ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ:' : 'Select target Date:'}</span>
          <input
            type="date"
            value={targetEventDate}
            onChange={(e) => setTargetEventDate(e.target.value)}
            className="text-xs bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/80 rounded px-2.5 py-1 outline-none font-bold font-mono focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* 1. Sponsoring Target Houses Section (DYNAMICALLY HIGHLIGHTING EXACTLY THREE CARDS) */}
      <div className="bg-white dark:bg-zinc-900/80 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-md space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 dark:bg-amber-950/20 border border-amber-500/20 px-2.5 py-0.5 rounded font-black tracking-widest uppercase">
              Target Saturday Sponsorship Rotation Loop
            </span>
            <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mt-1.5">
              <span>Sponsors for {targetEventDate} (Displaying exactly 3)</span>
            </h3>
          </div>
          
          {/* Override / Append custom house sponsorship selection */}
          {isAdmin && uninvitedActiveHouses.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider shrink-0">Custom Substitute:</span>
              <select
                className="bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 outline-none max-w-[200px]"
                value={addingHouseId}
                onChange={(e) => handleManualAddHouse(e.target.value)}
              >
                <option value="" className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800">-- Swap/Add custom sponsor --</option>
                {uninvitedActiveHouses.map(h => (
                  <option key={h.houseId} value={h.houseId} className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800">
                    {h.houseId} - {h.familyHeadName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {currentSlots.length === 0 ? (
          <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 border-dashed text-center">
            <p className="text-xs text-zinc-500 italic">No active houses available in register.</p>
          </div>
        ) : (
          /* ACTIVE / SUGGESTED 3 CARDS */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentSlots.map((slot) => {
              const { house, invitation, isSuggested } = slot;
              const isItemUpdating = updatingId === `${targetEventDate}_${house.houseId}`;
              const activeStatus = invitation?.status || 'none';

              return (
                <div 
                  key={house.houseId}
                  className={`p-5 rounded-2xl transition relative overflow-hidden group space-y-4 shadow-xs ${
                    isSuggested 
                      ? 'bg-amber-500/5 dark:bg-amber-950/10 border-2 border-dashed border-amber-500/30' 
                      : 'bg-zinc-50 dark:bg-zinc-800/65 border-2 border-emerald-500/30 hover:border-emerald-500/50'
                  }`}
                >
                  {/* Visual Background Glow */}
                  <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full pointer-events-none transition-opacity ${
                    isSuggested 
                      ? 'bg-gradient-to-bl from-amber-500/10 to-transparent' 
                      : 'bg-gradient-to-bl from-emerald-500/10 to-transparent'
                  }`} />

                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded font-mono text-[9px] font-black text-zinc-500 shrink-0">
                          {house.houseId}
                        </span>
                        
                        {isSuggested ? (
                          <span className="text-[8px] tracking-wider uppercase font-extrabold bg-amber-500 text-zinc-950 px-1.5 py-0.5 rounded">
                            Suggested Slot
                          </span>
                        ) : (
                          <span className="text-[8px] tracking-wider uppercase font-extrabold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                            Scheduled
                          </span>
                        )}
                      </div>

                      <h4 className="font-black text-zinc-800 dark:text-white text-xs truncate mt-1" title={house.familyHeadName}>
                        {house.familyHeadName}
                      </h4>
                      
                      <span className="text-[10px] text-zinc-455 dark:text-zinc-400 block truncate">
                        🏡 {house.houseName || 'No House Details'}
                      </span>
                      {house.phone && (
                        <span className="text-[9px] text-zinc-400 font-mono block">
                          📞 {house.phone}
                        </span>
                      )}
                    </div>

                    {/* Delete button (only if actually scheduled in DB) */}
                    {!isSuggested && isAdmin && (
                      <button
                        onClick={() => handleDeleteInvitationClick(house.houseId)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all cursor-pointer"
                        title="Remove sponsor representing this date (reverts slot to systemic rotation)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Status Options */}
                  <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 border-dashed">
                    <span className="text-[9px] uppercase font-black text-zinc-400 block">
                      {isSuggested ? 'Setup Invitation Status To Save:' : 'Current RSVP Status:'}
                    </span>
                    
                    <div className="grid grid-cols-2 gap-1 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-700/60 p-1 rounded-xl">
                      <button
                        onClick={() => handleStatusChange(house, 'pending')}
                        disabled={isItemUpdating || !isAdmin}
                        className={`text-[9px] font-extrabold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                          activeStatus === 'pending'
                            ? 'bg-amber-500 text-white shadow-xs font-black'
                            : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                        title="Mark as pending rotation"
                      >
                        <Clock className="w-2.5 h-2.5" />
                        <span>Pending</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange(house, 'invited')}
                        disabled={isItemUpdating || !isAdmin}
                        className={`text-[9px] font-extrabold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                          activeStatus === 'invited'
                            ? 'bg-indigo-600 text-white shadow-xs font-black'
                            : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                        title="Mark as invited/notified"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>Invited</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange(house, 'confirmed')}
                        disabled={isItemUpdating || !isAdmin}
                        className={`text-[9px] font-extrabold py-1.5 rounded-lg transition-colors col-span-2 mt-1 flex items-center justify-center gap-1 cursor-pointer ${
                          activeStatus === 'confirmed'
                            ? 'bg-emerald-600 text-white shadow-xs font-black'
                            : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                        title="Confirm as Saturday sponsor"
                      >
                        <CheckCircle className="w-2.5 h-2.5" />
                        <span>Confirmed Sponsor</span>
                      </button>
                    </div>

                    {/* Memo input */}
                    <div className="mt-2.5">
                      <input
                        type="text"
                        placeholder="Logged callback notes..."
                        value={invitation?.notes || ''}
                        disabled={!isAdmin || isSuggested}
                        onChange={(e) => handleNotesChange(house, e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/80 rounded-lg p-2 text-[10px] outline-none placeholder:text-zinc-400"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Informative alert: Rotational logic help */}
      <div className="bg-orange-50 dark:bg-orange-955/10 border border-orange-200/50 dark:border-orange-900/40 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-orange-850 dark:text-orange-300">
        <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
        <p className="font-sans">
          <strong>Rotational Protocol:</strong> Saturdays require <strong>exactly three host sponsors</strong>. Simply click on <strong>Pending</strong>, <strong>Invited</strong> or <strong>Confirmed</strong> on the dynamic yellow <strong>Suggested Slots</strong> above to save/lock an invitation. Saving a <strong>Puja Billing Record</strong> in the Billing section immediately advances the rotation order to the next 3 households!
        </p>
      </div>

      {/* 2. VILLAGE HOUSES COMPLETE ROLL - COLLAPSIBLE FOR CLEANLINESS */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        
        {/* Toggle Bar */}
        <button 
          onClick={() => setShowAllHouses(!showAllHouses)}
          className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg flex items-center justify-center">
              {showAllHouses ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">Show Roll & Register of All Remaining Village Houses ({activeHouses.length})</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Click to view complete queue, search, and override status/add notes manually for other families.</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 rounded">
            {showAllHouses ? 'Hide Roll' : 'Expand Roll'}
          </span>
        </button>

        {showAllHouses && (
          <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            
            {/* Search and status controls inside roll */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search houses by ID or Family Head..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-transparent dark:border-zinc-700 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-300 focus:outline-none transition text-zinc-800 dark:text-zinc-200"
                />
              </div>

              {/* Status checkboxes filtered menu */}
              <div className="md:col-span-2 flex overflow-x-auto gap-1 bg-zinc-50 dark:bg-zinc-800 p-1 rounded-xl scrollbar-none">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`flex-1 text-[10px] whitespace-nowrap font-bold uppercase transition py-1 px-2.5 rounded-lg ${
                    statusFilter === 'all' 
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  All ({activeHouses.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('none')}
                  className={`flex-1 text-[10px] whitespace-nowrap font-bold uppercase transition py-1 px-2.5 rounded-lg ${
                    statusFilter === 'none' 
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  No status
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`flex-1 text-[10px] whitespace-nowrap font-bold uppercase transition py-1 px-2.5 rounded-lg ${
                    statusFilter === 'pending' 
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('invited')}
                  className={`flex-1 text-[10px] whitespace-nowrap font-bold uppercase transition py-1 px-2.5 rounded-lg ${
                    statusFilter === 'invited' 
                      ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-400 shadow-sm' 
                      : 'text-zinc-555 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  Invited
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('confirmed')}
                  className={`flex-1 text-[10px] whitespace-nowrap font-bold uppercase transition py-1 px-2.5 rounded-lg ${
                    statusFilter === 'confirmed' 
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  Confirmed
                </button>
              </div>
            </div>

            {/* Table Frame of full catalog */}
            <div className="overflow-x-auto border border-zinc-100 dark:border-zinc-800 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 uppercase tracking-widest text-[9px] font-extrabold border-b border-zinc-100 dark:border-zinc-800">
                    <th className="py-3 px-5">House Details</th>
                    <th className="py-3 px-5">Last Sponsored</th>
                    <th className="py-3 px-5 text-center">Current Invitation Status</th>
                    <th className="py-3 px-5">Logged Notes / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {filteredAllHouses.map((item) => {
                    const inv = item.invitation;
                    const status = inv?.status || 'none';
                    const key = `${targetEventDate}_${item.houseId}`;
                    const isItemUpdating = updatingId === key;

                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                        
                        {/* Identity Column */}
                        <td className="py-3 px-5 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-[9px] font-black text-zinc-500">
                              {item.houseId}
                            </span>
                            <strong className="text-zinc-800 dark:text-white font-black">{item.familyHeadName}</strong>
                          </div>
                          <div className="text-[10px] text-zinc-400 flex items-center gap-2">
                            <span>🏡 {item.houseName}</span>
                            {item.phone && <span>· 📞 {item.phone}</span>}
                          </div>
                        </td>

                        {/* Rotational History Helper Column */}
                        <td className="py-3 px-5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.lastSponsored === 'Never Sponsored'
                              ? 'bg-red-50 text-red-700 dark:bg-red-955/20 dark:text-red-400'
                              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}>
                            {item.lastSponsored}
                          </span>
                        </td>

                        {/* Status Selectors / Radios column */}
                        <td className="py-3 px-5">
                          <div className="flex items-center justify-center gap-1">
                            
                            {/* None/No Invitation state */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(item, 'pending')} // Defaults to pending when first clicked
                              disabled={isItemUpdating}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition select-none ${
                                status === 'none'
                                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 cursor-pointer'
                                  : 'bg-transparent text-zinc-400 hover:text-zinc-600 cursor-pointer'
                              }`}
                            >
                              {status === 'none' ? 'No Invitation' : 'Reset'}
                            </button>

                            <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-100 dark:border-zinc-700">
                              
                              {/* Pending */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item, 'pending')}
                                disabled={isItemUpdating}
                                className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase transition select-none flex items-center gap-1 cursor-pointer ${
                                  status === 'pending'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                }`}
                              >
                                <Clock className="w-3 h-3" />
                                <span>Pending</span>
                              </button>

                              {/* Invited */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item, 'invited')}
                                disabled={isItemUpdating}
                                className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase transition select-none flex items-center gap-1 cursor-pointer ${
                                  status === 'invited'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-zinc-555 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                }`}
                              >
                                <Send className="w-3 h-3" />
                                <span>Invited</span>
                              </button>

                              {/* Confirmed */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item, 'confirmed')}
                                disabled={isItemUpdating}
                                className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase transition select-none flex items-center gap-1 cursor-pointer ${
                                  status === 'confirmed'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-zinc-555 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                }`}
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Confirmed</span>
                              </button>

                              {/* Cancelled */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item, 'cancelled')}
                                disabled={isItemUpdating}
                                className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase transition select-none flex items-center gap-1 cursor-pointer ${
                                  status === 'cancelled'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-[#EF4444] hover:bg-rose-50 dark:hover:bg-rose-955/20'
                                }`}
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Cancelled</span>
                              </button>

                            </div>

                          </div>
                        </td>

                        {/* Private Invitation details Notes column */}
                        <td className="py-3 px-5">
                          <input
                            type="text"
                            placeholder="e.g. Call back on Wed evening"
                            value={inv?.notes || ''}
                            onChange={(e) => handleNotesChange(item, e.target.value)}
                            disabled={!isAdmin}
                            className="bg-zinc-50 dark:bg-zinc-800 text-[10px] w-full p-1.5 focus:bg-white rounded-lg border border-transparent dark:border-zinc-700 focus:border-zinc-300 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                          />
                        </td>

                      </tr>
                    );
                  })}

                  {filteredAllHouses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-zinc-400 italic">
                        No house registers matched filter: "{statusFilter}" or keyword: "{searchTerm}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
