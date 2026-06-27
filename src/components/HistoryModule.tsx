import React, { useState } from 'react';
import { 
  Calendar, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Home, 
  IndianRupee, 
  Trash2, 
  ArrowUpDown, 
  Download, 
  CheckCircle,
  HelpCircle,
  Clock,
  Send,
  AlertCircle
} from 'lucide-react';
import { BhajaneEvent, Expense, Income, Invitation } from '../types';
import { Language, translations } from '../utils/translations';

interface HistoryModuleProps {
  events: BhajaneEvent[];
  expenses: Expense[];
  income: Income[];
  invitations: Invitation[];
  currencySymbol: string;
  isAdmin: boolean;
  onDeleteEvent: (id: string) => Promise<void>;
  language?: Language;
}

export default function HistoryModule({
  events,
  expenses,
  income,
  invitations,
  currencySymbol,
  isAdmin,
  onDeleteEvent,
  language = 'en'
}: HistoryModuleProps) {
  const t = translations[language];

  const [dateSearch, setDateSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sorting
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter & search events
  const filteredEvents = events.filter(e => {
    return e.date.includes(dateSearch) || (e.notes && e.notes.toLowerCase().includes(dateSearch.toLowerCase()));
  }).sort((a, b) => {
    return sortOrder === 'desc' 
      ? b.date.localeCompare(a.date) 
      : a.date.localeCompare(b.date);
  });

  // Calculate some aggregate historical facts
  const averageCollection = events.length > 0
    ? events.reduce((sum, e) => sum + e.totalIncome, 0) / events.length
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">{t.historyTitle}</h2>
          <p className="text-xs text-zinc-500">{t.historySubtitle}</p>
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="inline-flex items-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 p-2 px-4 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 transition"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
        </button>
      </div>

      {/* Control Action search bar */}
      <div className="relative bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center">
        <Search className="absolute left-6 top-5.5 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Filter history by Date (YYYY-MM-DD) or keywords in notes..."
          value={dateSearch}
          onChange={(e) => setDateSearch(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none"
        />
      </div>

      {/* Aggregate facts card strip */}
      <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 flex flex-wrap gap-x-8 gap-y-2 text-xs text-zinc-50 level font-bold">
        <span className="text-zinc-500">Saturday Gatherings: <strong className="text-zinc-800 dark:text-white font-extrabold">{events.length} weeks</strong></span>
        <span className="text-zinc-300 dark:text-zinc-600">|</span>
        <span className="text-zinc-500">Average Weekly Collection: <strong className="text-zinc-800 dark:text-white font-extrabold">{currencySymbol}{Math.round(averageCollection)}</strong></span>
        <span className="text-zinc-300 dark:text-zinc-600">|</span>
        <span className="text-indigo-600 dark:text-indigo-400">Total Sponsoring Incidences: <strong>{events.reduce((sum, e) => sum + (e.sponsors?.length || 0), 0)} houses</strong></span>
      </div>

      {/* List / Accordion Frames */}
      <div className="space-y-4">
        {filteredEvents.map((event) => {
          const isExpanded = expandedId === event.id;

          // Fetch event details
          const eventExpenses = expenses.filter(exp => exp.eventId === event.date || exp.date === event.date);
          const eventIncomes = income.filter(inc => inc.eventId === event.date || inc.date === event.date);
          const eventInvs = invitations.filter(inv => inv.eventId === event.date);

          return (
            <div 
              key={event.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-808 rounded-2xl overflow-hidden shadow-sm hover:border-zinc-200/80 transition-all duration-150"
            >
              
              {/* Header Bar Row */}
              <div 
                onClick={() => toggleExpand(event.id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/40 dark:hover:bg-zinc-800/10 transition-colors select-none"
              >
                
                {/* Left side: Date and Sponsors */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-black text-zinc-900 dark:text-white">{event.date}</span>
                    <span className="bg-orange-50 dark:bg-orange-950/20 text-[#D97706] text-[9px] px-1.5 py-0.5 rounded font-black uppercase">
                      Saturday Bhajane
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Home className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-[11px] text-zinc-400 uppercase font-black tracking-wide">Sponsors:</span>
                    {event.sponsors.map(spId => (
                      <span key={spId} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {spId}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Center / Right financials */}
                <div className="flex items-center gap-6 justify-between md:justify-end">
                  <div className="grid grid-cols-4 gap-x-4 text-right text-xs">
                    <div>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase">Income</div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">+{currencySymbol}{event.totalIncome}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase">Expenses</div>
                      <div className="font-bold text-red-500">-{currencySymbol}{event.totalExpenses}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase">Balance</div>
                      <div className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{currencySymbol}{event.remainingBalance}</div>
                    </div>
                    <div className="flex flex-col justify-center pl-2">
                      <span className={`inline-block px-2 py-1 rounded text-[9px] uppercase font-black tracking-wider text-center ${
                        event.remainingBalance >= 0 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450'
                      }`}>
                        {event.remainingBalance >= 0 ? 'Profit' : 'Loss'}
                      </span>
                    </div>
                  </div>

                  <div className="text-zinc-400 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

              </div>

              {/* Collapsible Panel details */}
              {isExpanded && (
                <div className="border-t border-zinc-100 dark:border-zinc-800/55 p-5 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs space-y-5 animate-slide-in">
                  
                  {/* Notes performance block */}
                  {event.notes && (
                    <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700/80 leading-relaxed text-zinc-500 dark:text-zinc-300 flex items-start gap-2.5">
                      <HelpCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-zinc-600 dark:text-zinc-200 font-bold">Saturday Summary Log:</strong>
                        <p className="mt-0.5 italic">{event.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Financial itemizations details split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Incomes lists */}
                    <div className="space-y-2 bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-100/50 dark:border-zinc-800">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex justify-between items-center bg-emerald-58/10 p-1 px-2 rounded">
                        <span>Collections Breakdown</span>
                        <span>Total: {currencySymbol}{event.totalIncome}</span>
                      </h4>

                      <div className="space-y-1.5">
                        <div className="flex justify-between p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded">
                          <span className="text-zinc-500">Sponsor Contributions ({event.sponsors.length} × {currencySymbol}{event.sponsorContribution})</span>
                          <span className="font-semibold text-zinc-800 dark:text-white font-mono">+{currencySymbol}{event.sponsorIncomeTotal}</span>
                        </div>
                        {eventIncomes.filter(inc => inc.source !== 'House Sponsor').map(inc => (
                          <div key={inc.id} className="flex justify-between p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded">
                            <span className="text-zinc-500">{inc.source} {inc.familyHeadName ? `(${inc.familyHeadName})` : ''}</span>
                            <span className="font-semibold text-zinc-800 dark:text-white font-mono">+{currencySymbol}{inc.amount}</span>
                          </div>
                        ))}
                        {event.donations > 0 && (
                          <div className="flex justify-between p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded">
                            <span className="text-zinc-500">Surplus Plate Collections API</span>
                            <span className="font-semibold text-zinc-800 dark:text-white font-mono">+{currencySymbol}{event.donations}</span>
                          </div>
                        )}
                        {event.otherIncome > 0 && (
                          <div className="flex justify-between p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded">
                            <span className="text-zinc-400">Other Miscellaneous</span>
                            <span className="font-semibold text-zinc-800 dark:text-white font-mono">+{currencySymbol}{event.otherIncome}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Spent lists */}
                    <div className="space-y-2 bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-100/50 dark:border-zinc-800">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-rose-500 flex justify-between items-center bg-rose-50/10 p-1 px-2 rounded">
                        <span>Saturday Outgoings Logs</span>
                        <span>Total: {currencySymbol}{event.totalExpenses}</span>
                      </h4>

                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {eventExpenses.map(exp => (
                          <div key={exp.id} className="flex justify-between p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded">
                            <div>
                              <p className="font-bold text-zinc-800 dark:text-zinc-200">{exp.expenseName}</p>
                              <p className="text-[10px] text-zinc-400 uppercase font-bold">{exp.category}</p>
                            </div>
                            <span className="font-black text-rose-600 font-mono">-{currencySymbol}{exp.amount}</span>
                          </div>
                        ))}
                        {eventExpenses.length === 0 && (
                          <p className="text-center py-4 italic text-zinc-400">No specific expenses recorded for this date.</p>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Invitations History state */}
                  {eventInvs.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-black uppercase text-zinc-400 tracking-widest">Invitation Records for this Saturday</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {eventInvs.map(inv => (
                          <div key={inv.id} className="bg-white dark:bg-zinc-800 p-2 rounded-lg border border-zinc-100 text-[11px] flex justify-between items-center">
                            <div>
                              <span className="block font-bold text-zinc-700 dark:text-zinc-100 truncate max-w-[100px]" title={inv.familyHeadName}>{inv.familyHeadName}</span>
                              <span className="text-[9px] text-zinc-400">{inv.houseId}</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                              inv.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-300'
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deletion control row */}
                  {isAdmin && (
                    <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
                      <button
                        onClick={() => {
                          if(confirm(`Are you absolutely sure you want to delete Saturday ${event.date} historical records? This cannot be reversed`)){
                            onDeleteEvent(event.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400 text-zinc-400 p-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wide transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete and Deduct Balance</span>
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed text-zinc-400">
            <Search className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold text-sm">No Saturday assemblies match query: "{dateSearch}"</p>
          </div>
        )}
      </div>

    </div>
  );
}
