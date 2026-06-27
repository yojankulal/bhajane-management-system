import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Save, Home, Coins, Trash2, HeartHandshake, FileText, CheckCircle } from 'lucide-react';
import { House, BhajaneEvent } from '../types';
import { Language, translations } from '../utils/translations';

interface WeeklyBhajaneProps {
  houses: House[];
  events: BhajaneEvent[];
  defaultContribution: number;
  isAdmin: boolean;
  currencySymbol: string;
  onAddEvent: (event: Omit<BhajaneEvent, 'id'>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  language?: Language;
}

export default function WeeklyBhajane({
  houses,
  events,
  defaultContribution,
  isAdmin,
  currencySymbol,
  onAddEvent,
  onDeleteEvent,
  language = 'en'
}: WeeklyBhajaneProps) {
  const t = translations[language];

  // Default next saturday calculation
  const getNextSaturdayStr = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (6 - day + 7) % 7;
    const daysToWait = diff === 0 ? 7 : diff;
    d.setDate(d.getDate() + daysToWait);
    return d.toISOString().split('T')[0];
  };

  // State
  const [date, setDate] = useState(getNextSaturdayStr());
  
  // Sponsors
  const [sponsorsList, setSponsorsList] = useState<string[]>(['', '', '']);
  
  const [contribution, setContribution] = useState<number>(defaultContribution);
  const [donations, setDonations] = useState<number>(0);
  const [otherIncome, setOtherIncome] = useState<number>(0);
  const [priestExpenses, setPriestExpenses] = useState<number>(0);
  const [shopExpenses, setShopExpenses] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // UI state
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if defaultContribution changes
  useEffect(() => {
    setContribution(defaultContribution);
  }, [defaultContribution]);

  const activeHouses = houses.filter(h => h.isActive);

  // Auto Calculations
  const sponsorCount = sponsorsList.filter(Boolean).length;
  const sponsorIncomeTotal = sponsorCount * contribution;
  const totalIncomeCalc = sponsorIncomeTotal + donations + otherIncome;
  const totalExpensesCalc = priestExpenses + shopExpenses;
  const remainingBalanceCalc = totalIncomeCalc - totalExpensesCalc;
  const isSurplus = remainingBalanceCalc >= 0;

  // Validation & Submit
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSuccess(false);

    if (!isAdmin) {
      setFormError('Forbidden: You must sign in with Google to log saturday services.');
      return;
    }

    if (!date) {
      setFormError('Please select a Saturday date.');
      return;
    }

    const selectedSponsors = sponsorsList.filter(Boolean);
    if (selectedSponsors.length === 0) {
      setFormError('Please select at least one sponsoring house.');
      return;
    }

    // Check for repetitive sponsor selection
    const hasDuplicates = selectedSponsors.length !== new Set(selectedSponsors).size;
    if (hasDuplicates) {
      setFormError('Every sponsoring house must be distinct.');
      return;
    }

    // Check if event already exists
    if (events.find(e => e.date === date)) {
      setFormError(`An event on ${date} is already registered in the system.`);
      return;
    }

    setIsSubmitting(true);

    try {
      await onAddEvent({
        date,
        sponsors: selectedSponsors,
        sponsorContribution: contribution,
        sponsorIncomeTotal,
        donations,
        otherIncome,
        totalIncome: totalIncomeCalc,
        totalExpenses: totalExpensesCalc,
        remainingBalance: remainingBalanceCalc,
        notes: notes.trim(),
        priestExpenses,
        shopExpenses
      });

      // Clear form
      setSponsorsList(['', '', '']);
      setDonations(0);
      setOtherIncome(0);
      setPriestExpenses(0);
      setShopExpenses(0);
      setNotes('');
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save Weekly Saturday Bhajane.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">{t.weeklyTitle}</h2>
        <p className="text-xs text-zinc-500">{t.weeklySubtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Creation Form Frame */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wide">{language === 'kn' ? 'ಶನಿವಾರದ ಪೂಜೆ ವಿವರ ದಾಖಲಿಸಿ' : 'Register Service Event'}</h3>
          </div>

          <form onSubmit={handleCreateEvent} className="space-y-5">
            
            {/* Date & Contribution fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Bhajane Saturday Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Sponsoring Contribution ({currencySymbol}) *</label>
                <input
                  type="number"
                  min="0"
                  value={contribution}
                  onChange={(e) => setContribution(Number(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-400"
                  required
                />
              </div>
            </div>

            {/* Sponsoring Houses Dropdowns */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-zinc-400" />
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Select Sponsoring Houses *</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSponsorsList([...sponsorsList, ''])}
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 hover:underline transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add House Sponsor</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sponsorsList.map((sponsorId, idx) => (
                  <div key={idx} className="space-y-1 relative bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase">House {idx + 1} Sponsor</span>
                      {sponsorsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = sponsorsList.filter((_, i) => i !== idx);
                            setSponsorsList(updated);
                          }}
                          className="text-[10px] text-zinc-400 hover:text-red-500 font-bold px-1"
                          title="Remove sponsor"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <select
                      value={sponsorId}
                      onChange={(e) => {
                        const updated = [...sponsorsList];
                        updated[idx] = e.target.value;
                        setSponsorsList(updated);
                      }}
                      className="w-full mt-1 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-300"
                      required
                    >
                      <option value="" className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800">-- Choose --</option>
                      {activeHouses.map(h => (
                        <option key={h.id} value={h.houseId} className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800">
                          {h.houseId} - {h.familyHeadName}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Extra collections and donations */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-zinc-400" />
                <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Additional Collections</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Extra Donations (Surplus Plate/Kanike) ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    value={donations}
                    onChange={(e) => setDonations(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Other Misc. Income (Coconut Auction, etc.) ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Saturday Night Outgoings Budgeting */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#F59E0B]" />
                <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Saturday Night Budgeting (Outgoings)</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Priest & Pooja Expenses ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Priest special fees, dakshina, flowers, etc."
                    value={priestExpenses || ''}
                    onChange={(e) => setPriestExpenses(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Shop / Grocery Expenses ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Purchases of the shop, oil, ghee, provisions, etc."
                    value={shopExpenses || ''}
                    onChange={(e) => setShopExpenses(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Notes field */}
            <div className="space-y-1 pt-2">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4 text-zinc-400" />
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Event Summary & Notes (Optional)</label>
              </div>
              <textarea
                placeholder="Log event description, singing performance, or attendees list..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none"
              />
            </div>

            {/* Error notifications */}
            {formError && (
              <div className="p-3 bg-red-100 dark:bg-red-950/20 text-red-800 dark:text-red-300 rounded-lg text-xs font-bold leading-snug">
                {formError}
              </div>
            )}

            {isSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Successfully recorded weekly saturday service. Balance sheets are updated.</span>
              </div>
            )}

            {/* Form actions */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[11px] text-zinc-400 font-medium">
                * Ensures duplicate entries prevention for a single date
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 px-5 py-3 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Logging Service...' : 'Log Saturday Service'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Dynamic Calculator Feed */}
        <div className="space-y-6">
          <div className="bg-zinc-900 dark:bg-zinc-900 text-zinc-100 p-5 rounded-2xl shadow-xl flex flex-col justify-between h-fit space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#F97316]">Live Collection Calculator</h4>
            
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Total Sponsoring Houses</span>
                <span className="font-bold text-zinc-200">{sponsorCount} {sponsorCount === 1 ? 'House' : 'Houses'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Rate per Sponsor House</span>
                <span className="font-bold text-zinc-200">{currencySymbol}{contribution}</span>
              </div>
              <p className="bg-zinc-950/40 p-2 text-[10px] text-zinc-400 rounded">
                Sponsors Contribution: {sponsorCount} × {currencySymbol}{contribution} = <strong>{currencySymbol}{sponsorIncomeTotal}</strong>
              </p>
              
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Extra Donations Log</span>
                <span className="font-mono text-emerald-400">+{currencySymbol}{donations}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Other Miscellaneous</span>
                <span className="font-mono text-emerald-400">+{currencySymbol}{otherIncome}</span>
              </div>

              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Priest Pooja Expenses</span>
                <span className="font-mono text-red-400">-{currencySymbol}{priestExpenses}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Shop / Grocery Expenses</span>
                <span className="font-mono text-red-400">-{currencySymbol}{shopExpenses}</span>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs font-bold text-zinc-300">
                <span>TOTAL COLLECTION</span>
                <span className="text-emerald-400">+{currencySymbol}{totalIncomeCalc.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-300 pb-2">
                <span>TOTAL EXPENSES</span>
                <span className="text-red-450 font-bold">-{currencySymbol}{totalExpensesCalc.toLocaleString()}</span>
              </div>

              <div className="pt-2 flex justify-between items-center text-sm font-black border-t border-zinc-800">
                <span className={isSurplus ? "text-emerald-400 font-extrabold uppercase tracking-wide" : "text-rose-450 font-extrabold uppercase tracking-wide"}>
                  {isSurplus ? "SATURDAY NET PROFIT" : "SATURDAY NET LOSS"}
                </span>
                <span className={`text-lg font-black ${isSurplus ? "text-emerald-400" : "text-rose-450"}`}>
                  {isSurplus ? "+" : "-"}{currencySymbol}{Math.abs(remainingBalanceCalc).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick House Legend info */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-105 dark:border-zinc-800 p-4 rounded-xl text-xs space-y-2 text-zinc-500">
            <h4 className="font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-widest text-[10px]">Village Legend Info</h4>
            <p className="leading-relaxed text-[11px]">
              Every house is invited to sponsor three times a year on a rotational basis. Ensure entries match actual dates. To change currency or defaults visit settings tab.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
