import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Coins, 
  Info, 
  Calendar, 
  User, 
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Sparkles
} from 'lucide-react';
import { House, BillingRecord, BillingSponsorInfo, Invitation } from '../types';
import { Language, translations } from '../utils/translations';

interface BillingManagementProps {
  houses: House[];
  invitations: Invitation[];
  billingRecords: BillingRecord[];
  isAdmin: boolean;
  currencySymbol: string;
  onAddBillingRecord: (record: Omit<BillingRecord, 'id'> & { id?: string }) => Promise<void>;
  onDeleteBillingRecord: (id: string) => Promise<void>;
  language?: Language;
}

export default function BillingManagement({
  houses,
  invitations,
  billingRecords,
  isAdmin,
  currencySymbol,
  onAddBillingRecord,
  onDeleteBillingRecord,
  language = 'en'
}: BillingManagementProps) {
  const t = translations[language];
  // Form States
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // State for the list of sponsors for this specific entry (multi-select)
  const [sponsorsList, setSponsorsList] = useState<BillingSponsorInfo[]>([]);

  // Individual fields
  const [shopExpenses, setShopExpenses] = useState<number>(0);
  const [priestExpenses, setPriestExpenses] = useState<number>(100); // Default to 100 as specified by user
  const [otherCollections, setOtherCollections] = useState<number>(0);
  const [otherExpenses, setOtherExpenses] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Dropdown search state for manually adding more sponsors
  const [searchTerm, setSearchTerm] = useState('');
  const [manualHouseId, setManualHouseId] = useState('');
  const [typedName, setTypedName] = useState('');
  const [typedHouseName, setTypedHouseName] = useState('');

  // UI status states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically pre-populate sponsors from the selected date's confirmed invitations
  useEffect(() => {
    if (!date) return;
    
    // Filter invitations matching this date
    // (checking eventId, looking at only confirmed houses)
    const confirmedInvitationsOnDay = invitations.filter(inv => 
      inv.eventId === date && inv.status === 'confirmed'
    );

    // Turn these invitations into default sponsors
    const prepopulatedSponsors: BillingSponsorInfo[] = confirmedInvitationsOnDay.map(inv => {
      // Look up original house for extra metadata safety, or fall back to invitation content
      const matchedHouse = houses.find(h => h.houseId === inv.houseId);
      return {
        houseId: inv.houseId,
        familyHeadName: matchedHouse?.familyHeadName || inv.familyHeadName || 'Sponsor',
        houseName: matchedHouse?.houseName || inv.houseName || '',
        contribution: 250 // default to 250 as required
      };
    });

    setSponsorsList(prepopulatedSponsors);
  }, [date, invitations, houses]);

  // Filter houses for searching additional manual sponsors
  const activeUnselectedHouses = houses.filter(h => 
    h.isActive && 
    !sponsorsList.some(s => s.houseId === h.houseId) &&
    (
      h.familyHeadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.houseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.houseName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Handlers for managing the dynamic sponsors list
  const handleAddSponsorDirectly = (houseId: string) => {
    const matched = houses.find(h => h.houseId === houseId);
    if (!matched) return;

    // Avoid duplicate insertions
    if (sponsorsList.some(s => s.houseId === houseId)) return;

    setSponsorsList(prev => [
      ...prev,
      {
        houseId: matched.houseId,
        familyHeadName: matched.familyHeadName,
        houseName: matched.houseName,
        contribution: 250 // default contribution
      }
    ]);
    
    // reset selectors
    setManualHouseId('');
    setSearchTerm('');
  };

  const handleAppendTypedSponsor = () => {
    if (!typedName.trim()) return;
    const tempId = `EXT_${Date.now()}`;
    setSponsorsList(prev => [
      ...prev,
      {
        houseId: tempId,
        familyHeadName: typedName.trim(),
        houseName: typedHouseName.trim() || 'Extra / Guest Puja',
        contribution: 250 // default contribution
      }
    ]);
    setTypedName('');
    setTypedHouseName('');
  };

  const handleRemoveSponsor = (houseId: string) => {
    setSponsorsList(prev => prev.filter(s => s.houseId !== houseId));
  };

  const handleUpdateContribution = (houseId: string, amount: number) => {
    setSponsorsList(prev => prev.map(s => {
      if (s.houseId === houseId) {
        return { ...s, contribution: amount };
      }
      return s;
    }));
  };

  // Live Calculations (as described: sponsor total + plate collections vs expenses)
  const totalSponsorIncome = sponsorsList.reduce((sum, s) => sum + s.contribution, 0);
  const totalIncomeCalc = totalSponsorIncome + otherCollections;
  const totalExpensesCalc = shopExpenses + priestExpenses + otherExpenses;
  const netProfitLoss = totalIncomeCalc - totalExpensesCalc;
  const isSurplus = netProfitLoss >= 0;

  // Form Submitter
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setErrorMsg('Unauthorized: Only administrators are authorized to log or lock Billing records.');
      return;
    }
    if (!date) {
      setErrorMsg('Please select a valid date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      // Save billing record to Firestore. Document ID matches the YYYY-MM-DD
      await onAddBillingRecord({
        id: date,
        date,
        sponsors: sponsorsList,
        sponsorContributionTotal: totalSponsorIncome,
        shopExpenses,
        priestExpenses,
        otherCollections,
        otherExpenses,
        totalIncome: totalIncomeCalc,
        totalExpenses: totalExpensesCalc,
        remainingBalance: netProfitLoss,
        notes: notes.trim()
      });

      // Clear non-retained fields
      setOtherCollections(0);
      setOtherExpenses(0);
      setNotes('');
      setSearchTerm('');
      setManualHouseId('');
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed saving billing ledger record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/25 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-zinc-800 dark:text-white">{t.billingTitle}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{t.billingSubtitle}</p>
          </div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800 p-2.5 px-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50 flex gap-4 text-xs font-bold shrink-0">
          <div>
            <span className="text-zinc-400 block text-[9px] uppercase tracking-wide">{language === 'kn' ? 'ಖಾತೆ ಪುಸ್ತಕ ದಾಖಲೆಗಳು' : 'Ledger Sheets'}</span>
            <span className="text-zinc-800 dark:text-zinc-200 mt-0.5 block font-mono font-black">{billingRecords.length} {language === 'kn' ? 'ದಾಖಲೆಗಳು' : 'Records'}</span>
          </div>
          <div className="border-l border-zinc-200 dark:border-zinc-800 pl-4">
            <span className="text-zinc-400 block text-[9px] uppercase tracking-wide">{language === 'kn' ? 'ಒಟ್ಟು ಉಳಿತಾಯ' : 'Accumulated Net'}</span>
            <span className={`mt-0.5 block font-mono font-black ${
              billingRecords.reduce((s, r) => s + r.remainingBalance, 0) >= 0 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-rose-455'
            }`}>
              {currencySymbol}{billingRecords.reduce((s, r) => s + r.remainingBalance, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Form Entry + Live Financial Ledger Breakout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/80 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Coins className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">Puja Day Budget Entry Form</h3>
            {!isAdmin && (
              <span className="ml-auto text-[10px] bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded font-bold uppercase">
                View Only
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. Date of Puja (Triggers auto-load of invitations) */}
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Selected Date of Puja</span>
              </label>
              <input
                type="date"
                required
                disabled={isSubmitting}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-750 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-[10px] text-zinc-400">
                Selecting a date automatically fetches all confirmed invitations booked for that day as the default sponsors.
              </p>
            </div>

            {/* 2. Sponsoring Houses List (Custom, Multiple fields) */}
            <div className="bg-zinc-50/50 dark:bg-zinc-800/20 p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-2">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Sponsoring Houses on this Day</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-400 font-extrabold bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded">
                  {sponsorsList.length} Head(s)
                </span>
              </div>

              {sponsorsList.length === 0 ? (
                <div className="py-4 text-center text-zinc-400 space-y-1">
                  <span className="text-[11px] font-bold block uppercase tracking-wider text-amber-500">No Default Sponsors Found</span>
                  <span className="text-[10px] text-zinc-400 max-w-sm mx-auto block">
                    There are no registered active invitations for {date}. You can manually search and add family heads below.
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {sponsorsList.map((sponsor, index) => (
                    <div 
                      key={sponsor.houseId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-xl"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="w-7 h-7 shrink-0 text-[10px] font-black uppercase text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <div className="truncate">
                          <span className="text-xs font-black text-zinc-800 dark:text-white block">
                            {sponsor.familyHeadName}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 block">
                            House ID: {sponsor.houseId} {sponsor.houseName ? `• ${sponsor.houseName}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="space-y-0.5">
                          <label className="text-[9px] uppercase font-black tracking-wider text-zinc-400 block text-right">Contribution Amount</label>
                          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-2 py-1 border border-zinc-200 dark:border-zinc-700">
                            <span className="text-[11px] text-zinc-400 font-bold">{currencySymbol}</span>
                            <input
                              type="number"
                              min="0"
                              disabled={!isAdmin || isSubmitting}
                              value={sponsor.contribution}
                              onChange={(e) => handleUpdateContribution(sponsor.houseId, Number(e.target.value))}
                              className="w-16 bg-transparent text-xs text-zinc-800 dark:text-zinc-200 font-mono font-black text-right p-0 border-none focus:outline-none focus:ring-0"
                            />
                          </div>
                        </div>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSponsor(sponsor.houseId)}
                            className="p-1.5 mt-4 text-red-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                            title="Remove family from today's sponsor list"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Manual Sponsor searchable search and append */}
              {isAdmin && (
                <div className="pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Supplement / Append Sponsoring Family (Registered or Custom)</span>
                  </div>

                  {/* Method A: Registered Houses Dropdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Search Registered House Register</span>
                      <input
                        type="text"
                        placeholder="Filter name / House ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700/80 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Add Matched Registered House</span>
                      <select
                        className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700/80 focus:outline-none"
                        value={manualHouseId}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            handleAddSponsorDirectly(val);
                          }
                        }}
                      >
                        <option value="" className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800">-- Choose Family to Append --</option>
                        {activeUnselectedHouses.map(house => (
                          <option key={house.houseId} value={house.houseId} className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800">
                            {house.houseId} - {house.familyHeadName} ({house.houseName})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Method B: Or Manually Type Custom Name Directly */}
                  <div className="pt-2 border-t border-dotted border-zinc-200 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block">Or Manually Type Custom Presenter / Extra Sponsor</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div className="space-y-1 md:col-span-1">
                        <input
                          type="text"
                          placeholder="Family Head / Sponsor Name (Mandatory)"
                          value={typedName}
                          onChange={(e) => setTypedName(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700/80 focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-1">
                        <input
                          type="text"
                          placeholder="House description / Village / Details"
                          value={typedHouseName}
                          onChange={(e) => setTypedHouseName(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700/80 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={handleAppendTypedSponsor}
                          disabled={!typedName.trim()}
                          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-[10px] uppercase tracking-wider py-2 rounded-lg disabled:opacity-40 transition-all shadow-xs cursor-pointer"
                        >
                          Append Extra Sponsor
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* 3. Coin collections and plate offerings (Incomings) */}
            <div className="bg-zinc-50/50 dark:bg-zinc-800/20 p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-3">
              <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Plate Donations & Small Cash Offering</h4>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Coin Plate Counting / Donations ({currencySymbol})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="E.g. plate count contributions: 10, 20 Rs, etc."
                    disabled={!isAdmin || isSubmitting}
                    value={otherCollections || ''}
                    onChange={(e) => setOtherCollections(Number(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
                <p className="text-[9px] text-zinc-400">
                  Cash plate counters, coins, custom guest offerings except the registered hosting house sponsors.
                </p>
              </div>
            </div>

            {/* 4. Priest & Shop Expenditures */}
            <div className="bg-zinc-50/50 dark:bg-zinc-800/20 p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-3">
              <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Day's Expenditures & Cost Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Priest dakshina / payments ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={!isAdmin || isSubmitting}
                    value={priestExpenses}
                    onChange={(e) => setPriestExpenses(Number(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                  <p className="text-[9px] text-zinc-400">Default is set to 100 as requested. Fully customizable.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Shop / Grocery Expenses ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="E.g. oil, ghee, fruits, flowers"
                    disabled={!isAdmin || isSubmitting}
                    value={shopExpenses || ''}
                    onChange={(e) => setShopExpenses(Number(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                  <p className="text-[9px] text-zinc-400">Oil count, ghee, shop purchases or fruits spent.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Other / Overall Expense ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Other miscellaneous items..."
                    disabled={!isAdmin || isSubmitting}
                    value={otherExpenses || ''}
                    onChange={(e) => setOtherExpenses(Number(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                  <p className="text-[9px] text-zinc-400">Optional extra items, transport, repair.</p>
                </div>

              </div>
            </div>

            {/* 5. Notes */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Ledger Remarks / Memo</label>
              <textarea
                rows={2}
                placeholder="Write specific notes or details (e.g. Special festive celebration context)..."
                disabled={!isAdmin || isSubmitting}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Error alerts */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/25 border border-rose-150 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex gap-2.5 font-medium items-center">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isSuccess && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs flex gap-2.5 font-medium items-center">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>Billing account locked & logged to safe storage books.</span>
              </div>
            )}

            {/* Submit Action Block */}
            {isAdmin && (
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || sponsorsList.length === 0}
                  className="bg-zinc-950 hover:bg-zinc-900 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-zinc-950 text-white font-extrabold text-[11px] uppercase tracking-wider py-3.5 px-6 rounded-xl flex items-center gap-2 transition hover:scale-[1.01] shadow-lg shadow-zinc-950/10 dark:shadow-amber-500/5 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span>Registering Accounts...</span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Lock & Log Billing Sheet</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </form>
        </div>

        {/* Right Panel: Handshake real-time calculations ledger card */}
        <div className="bg-zinc-950 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden border border-zinc-800/60 sticky top-6 self-start">
          
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">LOCKED-SITU STATEMENT</span>
              <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                Active Audit
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-zinc-400 font-bold block">DATE OF AUDIT</span>
              <span className="text-xl font-black text-amber-500 font-mono tracking-tight">{date || 'YYYY-MM-DD'}</span>
            </div>

            {/* Incomings breakdown */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] font-black tracking-widest text-[#F59E0B] uppercase">Day's Incomings (Profits)</span>
              <div className="space-y-1.5 text-xs text-zinc-300">
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-400 font-medium">Sponsors contributions total</span>
                  <span className="font-mono text-emerald-400 font-bold">+{currencySymbol}{totalSponsorIncome}</span>
                </div>
                {sponsorsList.length > 0 && (
                  <div className="pl-3 space-y-1 text-[10px] text-zinc-400 pb-1 border-l border-zinc-800 mt-1">
                    {sponsorsList.map(s => (
                      <div key={s.houseId} className="flex justify-between">
                        <span className="truncate max-w-[120px]">{s.familyHeadName}</span>
                        <span className="font-mono">{currencySymbol}{s.contribution}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between border-b border-zinc-800 pb-1.5 pt-1">
                  <span className="text-zinc-400 font-medium">Coin counters (Plate Kanike)</span>
                  <span className="font-mono text-emerald-400 font-bold">+{currencySymbol}{otherCollections}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-xs pt-1">
                  <span>Gross Sponsoring Cash</span>
                  <span className="font-mono text-emerald-400 font-black">+{currencySymbol}{totalIncomeCalc}</span>
                </div>
              </div>
            </div>

            {/* Outgoings breakdown */}
            <div className="space-y-2.5 pt-3">
              <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Day's Outgoings (Costs)</span>
              <div className="space-y-1.5 text-xs text-zinc-300">
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-400 font-medium">Grocery shop purchases</span>
                  <span className="font-mono text-red-400 font-bold">-{currencySymbol}{shopExpenses}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-400 font-medium">Priest dakshina charges</span>
                  <span className="font-mono text-red-400 font-bold">-{currencySymbol}{priestExpenses}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-400 font-medium">Other misc costs</span>
                  <span className="font-mono text-red-400 font-bold">-{currencySymbol}{otherExpenses}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-xs pt-1">
                  <span>Total Expenditures</span>
                  <span className="font-mono text-red-400 font-black">-{currencySymbol}{totalExpensesCalc}</span>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-zinc-800 mt-8 space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 block">Balance Result</span>
                <span className={`text-gray-500 dark:text-gray-400 font-extrabold text-[11px] block tracking-wide mt-0.5 uppercase ${
                  isSurplus ? 'text-emerald-400' : 'text-rose-455'
                }`}>
                  {isSurplus ? 'Gross Profit' : 'Gross Deficit'}
                </span>
              </div>
              <span className={`text-2xl font-black font-mono leading-none ${
                isSurplus ? 'text-emerald-400' : 'text-rose-450'
              }`}>
                {isSurplus ? '+' : '-'}{currencySymbol}{Math.abs(netProfitLoss).toLocaleString()}
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800/80 p-3 rounded-xl text-[10px] text-zinc-400 leading-normal flex items-start gap-2 select-none">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Verified balance logs immediately audit overall financial sheets upon clicking locks. Adjust inputs to audit correctly.
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Historical Ledger Table below */}
      <div className="bg-white dark:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-50 dark:border-zinc-800/50 pb-3">
          <div className="inline-flex items-center gap-2 font-black text-zinc-800 dark:text-white text-xs uppercase tracking-widest">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Pooja Day Historical Ledger Books</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-black bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 rounded">
            Overall Logs: <strong className="text-zinc-800 dark:text-zinc-200">{billingRecords.length} Registers</strong>
          </span>
        </div>

        {billingRecords.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 space-y-2">
            <Coins className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 animate-bounce" />
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">No Historical Ledger Logs Registered</p>
            <p className="text-[10px] text-zinc-400 max-w-xs mx-auto">Logged entries are stored in online Firestore books, updating accounts and printing statistics instantly.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800/80 text-zinc-400 uppercase tracking-widest text-[9px] font-black">
                  <th className="py-3 px-4">Date of Puja</th>
                  <th className="py-3 px-4">Sponsoring Families</th>
                  <th className="py-3 px-4 text-right">Sum Spon. Amt</th>
                  <th className="py-3 px-4 text-right">Coins Inflow</th>
                  <th className="py-3 px-4 text-right">Shop Exp</th>
                  <th className="py-3 px-4 text-right">Priest Dakshina</th>
                  <th className="py-3 px-4 text-right">Misc Exp</th>
                  <th className="py-3 px-4 text-right">Profit / Loss Balance</th>
                  {isAdmin && <th className="py-3 px-4 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-850">
                {billingRecords.map((record) => {
                  const daySponCount = record.sponsorContributionTotal || 0;
                  const dayInflow = record.otherCollections || 0;
                  const dayShop = record.shopExpenses || 0;
                  const dayPriest = record.priestExpenses || 0;
                  const dayMisc = record.otherExpenses || 0;
                  const dayNet = record.remainingBalance || 0;
                  const entryIsSurplus = dayNet >= 0;

                  return (
                    <tr key={record.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/15 transition-colors">
                      <td className="py-3 px-4 font-bold font-mono text-zinc-600 dark:text-zinc-300">
                        {record.date}
                      </td>
                      <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                        {record.sponsors && record.sponsors.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                            {record.sponsors.map(sp => (
                              <span 
                                key={sp.houseId} 
                                className="inline-block bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-[9px] font-bold text-zinc-700 dark:text-zinc-300"
                              >
                                {sp.familyHeadName} ({currencySymbol}{sp.contribution})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic text-[10px]">No family registered</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        +{currencySymbol}{daySponCount}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {dayInflow > 0 ? `+${currencySymbol}${dayInflow}` : '₹0'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-red-500 font-medium">
                        {dayShop > 0 ? `-${currencySymbol}${dayShop}` : '₹0'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-red-500 font-medium">
                        {dayPriest > 0 ? `-${currencySymbol}${dayPriest}` : '₹0'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-red-500 font-medium">
                        {dayMisc > 0 ? `-${currencySymbol}${dayMisc}` : '₹0'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-block font-mono font-black px-2 py-0.5 rounded text-[10px] ${
                          entryIsSurplus 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                        }`}>
                          {entryIsSurplus ? '+' : ''}{currencySymbol}{dayNet}
                        </span>
                        {record.notes && (
                          <div className="text-[8px] text-zinc-400 dark:text-zinc-400 font-sans tracking-wide leading-none truncate max-w-[140px] mt-1 pr-1 hover:text-wrap hover:whitespace-normal" title={record.notes}>
                            Memo: {record.notes}
                          </div>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this Pooja's Billing Ledger sheet from database? This will cascade-delete corresponding financial bookkeeping transfers also!")) {
                                await onDeleteBillingRecord(record.id);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                            title="Delete this billing ledger log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
