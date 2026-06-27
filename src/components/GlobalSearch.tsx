import React, { useState } from 'react';
import { 
  Search, 
  Home, 
  Calendar, 
  TrendingDown, 
  CheckSquare, 
  Compass, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { House, BhajaneEvent, Expense, Invitation } from '../types';
import { Language, translations } from '../utils/translations';

interface GlobalSearchProps {
  houses: House[];
  events: BhajaneEvent[];
  expenses: Expense[];
  invitations: Invitation[];
  currencySymbol: string;
  onNavigate: (tab: string) => void;
  language?: Language;
}

export default function GlobalSearch({
  houses,
  events,
  expenses,
  invitations,
  currencySymbol,
  onNavigate,
  language = 'en'
}: GlobalSearchProps) {
  const t = translations[language];

  const [query, setQuery] = useState('');

  const trimmedQuery = query.toLowerCase().trim();

  // 1. Matches Houses
  const matchedHouses = trimmedQuery ? houses.filter(h => 
    h.houseId.toLowerCase().includes(trimmedQuery) ||
    h.familyHeadName.toLowerCase().includes(trimmedQuery) ||
    h.houseName.toLowerCase().includes(trimmedQuery) ||
    (h.phone && h.phone.includes(trimmedQuery)) ||
    (h.address && h.address.toLowerCase().includes(trimmedQuery))
  ) : [];

  // 2. Matches Events (Dates or sponsors)
  const matchedEvents = trimmedQuery ? events.filter(e => 
    e.date.includes(trimmedQuery) ||
    e.sponsors.some(sp => sp.toLowerCase().includes(trimmedQuery)) ||
    (e.notes && e.notes.toLowerCase().includes(trimmedQuery))
  ) : [];

  // 3. Matches Expenses
  const matchedExpenses = trimmedQuery ? expenses.filter(exp => 
    exp.expenseName.toLowerCase().includes(trimmedQuery) ||
    exp.category.toLowerCase().includes(trimmedQuery) ||
    exp.date.includes(trimmedQuery) ||
    (exp.description && exp.description.toLowerCase().includes(trimmedQuery))
  ) : [];

  // 4. Matches Invitations
  const matchedInvitations = trimmedQuery ? invitations.filter(inv => 
    inv.eventId.includes(trimmedQuery) ||
    inv.familyHeadName.toLowerCase().includes(trimmedQuery) ||
    inv.houseName.toLowerCase().includes(trimmedQuery) ||
    inv.houseId.toLowerCase().includes(trimmedQuery) ||
    inv.status.includes(trimmedQuery)
  ) : [];

  const totalResults = matchedHouses.length + matchedEvents.length + matchedExpenses.length + matchedInvitations.length;

  return (
    <div className="space-y-6">
      
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700/50 p-6 md:p-8 rounded-3xl text-white shadow relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-5 scale-150 translate-y-12 select-none leading-none font-bold text-9xl">
          🔍
        </div>
        
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="text-[10px] uppercase font-black tracking-widest text-[#F59E0B]">{language === 'kn' ? 'ಏಕೀಕೃತ ಗ್ರಾಮ ಸೂಚಿಕೆ' : 'Unified Village Indexer'}</span>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wide">{t.masterSearch}</h2>
          <p className="text-zinc-300 text-xs">{language === 'kn' ? 'ಯಾವುದೇ ನೋಂದಾಯಿತ ಗ್ರಾಮಸ್ಥರು, ಹಿಂದಿನ ಶನಿವಾರದ ದಿನಾಂಕಗಳು, ದಾಖಲಾದ ಖರ್ಚುಗಳು ಅಥವಾ ಆಮಂತ್ರಣಗಳನ್ನು ತಕ್ಷಣ ಹುಡುಕಿ.' : 'Instantly locate any registered villager, historical Saturday date, logged expenditures or invitations across collections.'}</p>
          
          <div className="relative mt-2">
            <Search className="absolute left-3.5 top-3 w-5 h-5 text-gray-450" />
            <input
              id="global-search-input"
              type="text"
              placeholder={language === 'kn' ? 'ಯಾವುದನ್ನಾದರೂ ಹುಡುಕಿ (ಉದಾ: ಹೆಗಡೆ, ಹೂವುಗಳು, 2026-06)...' : 'Search anything (e.g. Hegde, Flowers, 2026-06, H-03)...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 font-semibold p-3 pl-11 rounded-2xl border-none outline-none text-xs focus:ring-2 focus:ring-amber-500 shadow-md"
            />
          </div>
        </div>
      </div>

      {query && (
        <p className="text-xs text-zinc-500 font-semibold uppercase">
          Found <strong>{totalResults} results</strong> for query "{query}"
        </p>
      )}

      {/* Grid of Results */}
      {trimmedQuery ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          
          {/* Matched Houses */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-wide flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <Home className="w-4 h-4 text-orange-500" />
              <span>Matching Registered Houses ({matchedHouses.length})</span>
            </h3>

            {matchedHouses.map(h => (
              <div 
                key={h.id} 
                onClick={() => onNavigate('houses')}
                className="p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 rounded-xl flex items-center justify-between cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition"
              >
                <div>
                  <span className="text-[10px] font-bold font-mono text-zinc-400 dark:text-zinc-500 block">{h.houseId}</span>
                  <strong className="text-xs text-zinc-800 dark:text-zinc-200">{h.familyHeadName}</strong>
                  <span className="block text-[10px] text-zinc-400 dark:text-zinc-500">🏡 {h.houseName}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              </div>
            ))}
            {matchedHouses.length === 0 && <p className="text-zinc-400 dark:text-zinc-500 italic text-[11px] text-center py-4">No matching registered houses.</p>}
          </div>

          {/* Matched Events */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-wide flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <Calendar className="w-4 h-4 text-emerald-550" />
              <span>Matching saturday assemblies ({matchedEvents.length})</span>
            </h3>

            {matchedEvents.map(e => (
              <div 
                key={e.id} 
                onClick={() => onNavigate('history')}
                className="p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 rounded-xl flex items-center justify-between cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition"
              >
                <div>
                  <strong className="text-xs text-zinc-800 dark:text-zinc-200 block">{e.date}</strong>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Sponsors: <span className="font-semibold text-zinc-600 dark:text-zinc-300">{e.sponsors.join(', ')}</span></p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Collection total: <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{currencySymbol}{e.totalIncome}</span></p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              </div>
            ))}
            {matchedEvents.length === 0 && <p className="text-zinc-400 dark:text-zinc-500 italic text-[11px] text-center py-4">No matching past Saturdays.</p>}
          </div>

          {/* Matched Expenses */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-wide flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <TrendingDown className="w-4 h-4 text-rose-550" />
              <span>Matching recorded expenses ({matchedExpenses.length})</span>
            </h3>

            {matchedExpenses.map(exp => (
              <div 
                key={exp.id} 
                onClick={() => onNavigate('billing')}
                className="p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 rounded-xl flex items-center justify-between cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition"
              >
                <div>
                  <strong className="text-xs text-zinc-800 dark:text-zinc-200 block">{exp.expenseName}</strong>
                  <span className="text-[9px] bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 uppercase px-1.5 py-0.5 rounded font-black mt-1 inline-block">{exp.category}</span>
                  <span className="block text-[10px] text-zinc-400 dark:text-zinc-400 mt-1">Date: {exp.date}</span>
                </div>
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono text-xs">-{currencySymbol}{exp.amount}</span>
              </div>
            ))}
            {matchedExpenses.length === 0 && <p className="text-zinc-400 dark:text-zinc-500 italic text-[11px] text-center py-4">No matching expenditures.</p>}
          </div>

          {/* Matched Invitations */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-wide flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <CheckSquare className="w-4 h-4 text-indigo-550" />
              <span>Matching invitations ({matchedInvitations.length})</span>
            </h3>

            {matchedInvitations.map(inv => (
              <div 
                key={inv.id} 
                onClick={() => onNavigate('invitations')}
                className="p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 rounded-xl flex items-center justify-between cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition"
              >
                <div>
                  <strong className="text-xs text-zinc-800 dark:text-zinc-200 block">{inv.familyHeadName}</strong>
                  <span className="block text-[10px] text-zinc-400 dark:text-zinc-500">Target Date: {inv.eventId} · {inv.houseName}</span>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                  inv.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}>
                  {inv.status}
                </span>
              </div>
            ))}
            {matchedInvitations.length === 0 && <p className="text-zinc-400 dark:text-zinc-500 italic text-[11px] text-center py-4">No matching invitation status cards.</p>}
          </div>

        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed text-zinc-400 dark:text-zinc-500 space-y-3 border-zinc-200 dark:border-zinc-800">
          <Compass className="w-8 h-8 mx-auto hover:animate-spin transition-all" />
          <p className="font-semibold text-sm">Please type queries above to search global collections.</p>
          <div className="max-w-xs mx-auto text-[10px] bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded leading-relaxed text-zinc-400 dark:text-zinc-500 flex items-start gap-1">
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Search houses by head names, dates like <strong>"2026-06"</strong>, expenses like <strong>"Flowers"</strong>, or target house IDs.</span>
          </div>
        </div>
      )}

    </div>
  );
}
