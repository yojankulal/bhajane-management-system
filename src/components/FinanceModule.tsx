import React, { useState } from 'react';
import { 
  PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  Search, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Tag, 
  Calendar, 
  Award,
  CircleDollarSign,
  BriefcaseMedical,
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { Expense, Income, ExpenseCategory, BhajaneEvent, House } from '../types';

interface FinanceModuleProps {
  expenses: Expense[];
  income: Income[];
  events: BhajaneEvent[];
  houses: House[];
  currencySymbol: string;
  isAdmin: boolean;
  onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  onAddIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  onDeleteIncome: (id: string) => Promise<void>;
}

export default function FinanceModule({
  expenses,
  income,
  events,
  houses,
  currencySymbol,
  isAdmin,
  onAddExpense,
  onDeleteExpense,
  onAddIncome,
  onDeleteIncome
}: FinanceModuleProps) {

  const [activeSubTab, setActiveSubTab] = useState<'balance' | 'income' | 'expenses'>('balance');
  
  // Searching & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Expense form state
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [expenseName, setExpenseName] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Flowers');
  const [expenseAmount, setExpenseAmount] = useState<number>(100);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseEventId, setExpenseEventId] = useState('');

  // Income form state
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false);
  const [incomeSource, setIncomeSource] = useState<string>('Donation'); // Donation or Other
  const [incomeAmount, setIncomeAmount] = useState<number>(500);
  const [incomeDesc, setIncomeDesc] = useState('');
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0]);
  const [incomeFamilyHead, setIncomeFamilyHead] = useState('');
  const [incomeEventId, setIncomeEventId] = useState('');

  // Validation/Error state
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category array
  const categories: ExpenseCategory[] = [
    'Priest (Pooja)',
    'Flowers',
    'Coconut',
    'Fruits',
    'Shop Items',
    'Snacks',
    'Sound System',
    'Decoration',
    'Other'
  ];

  // 1. Calculations
  const sponsorIncomeTotal = events.reduce((sum, e) => sum + (e.sponsorIncomeTotal || 0), 0);
  const totalDonations = income.filter(i => i.source === 'Donation').reduce((sum, i) => sum + i.amount, 0);
  const totalOtherIncome = income.filter(i => i.source === 'Other').reduce((sum, i) => sum + i.amount, 0);
  
  // Aggregate Income from all sources
  // (Either events or separate manual income lines)
  const totalIncomeAggregate = events.reduce((sum, e) => sum + (e.totalIncome || 0), 0);
  const totalExpensesAggregate = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncomeAggregate - totalExpensesAggregate;

  // 2. Submit Handlers
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!expenseName.trim()) {
      setFormError('Expense Name is required.');
      return;
    }
    if (expenseAmount <= 0) {
      setFormError('Amount must be positive.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await onAddExpense({
        expenseName: expenseName.trim(),
        category: expenseCategory,
        amount: expenseAmount,
        description: expenseDesc.trim() || undefined,
        date: expenseDate,
        eventId: expenseEventId || undefined
      });
      setIsExpenseFormOpen(false);
      // Clear
      setExpenseName('');
      setExpenseAmount(100);
      setExpenseDesc('');
      setExpenseEventId('');
    } catch (err: any) {
      setFormError(err?.message || 'Error saving expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (incomeAmount <= 0) {
      setFormError('Amount must be positive.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await onAddIncome({
        source: incomeSource,
        amount: incomeAmount,
        description: incomeDesc.trim() || undefined,
        familyHeadName: incomeFamilyHead.trim() || undefined,
        date: incomeDate,
        eventId: incomeEventId || undefined
      });
      setIsIncomeFormOpen(false);
      setIncomeAmount(500);
      setIncomeDesc('');
      setIncomeFamilyHead('');
      setIncomeEventId('');
    } catch (err: any) {
      setFormError(err?.message || 'Error saving income.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Category Expenses breakdown map
  const categoryExpensesMap: Record<ExpenseCategory, number> = {} as any;
  categories.forEach(c => { categoryExpensesMap[c] = 0; });
  expenses.forEach(exp => {
    if (categoryExpensesMap[exp.category] !== undefined) {
      categoryExpensesMap[exp.category] += exp.amount;
    } else {
      categoryExpensesMap[exp.category] = exp.amount;
    }
  });

  // Filter incomes
  const filteredIncomes = income.filter(inc => {
    const term = searchQuery.toLowerCase();
    return (
      inc.source.toLowerCase().includes(term) ||
      (inc.description && inc.description.toLowerCase().includes(term)) ||
      (inc.familyHeadName && inc.familyHeadName.toLowerCase().includes(term)) ||
      inc.date.includes(term)
    );
  });

  // Filter expenses
  const filteredExpenses = expenses.filter(exp => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      exp.expenseName.toLowerCase().includes(term) ||
      (exp.description && exp.description.toLowerCase().includes(term)) ||
      exp.date.includes(term);

    const matchesCategory = 
      categoryFilter === 'all' || 
      exp.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Highlight Category styles
  const getSubTabClass = (tab: typeof activeSubTab) => {
    return `text-xs font-black uppercase tracking-wider py-2.5 px-6 rounded-xl transition ${
      activeSubTab === tab 
        ? 'bg-zinc-900 border-transparent text-white dark:bg-amber-500 dark:text-zinc-950 shadow-md' 
        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
    }`;
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">Financial Accounts</h2>
          <p className="text-xs text-zinc-500">Examine income collections, expenditures, and net balance sheet books</p>
        </div>

        {/* Floating Action Buttons */}
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setIsIncomeFormOpen(true); setFormError(''); }}
              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] uppercase tracking-wide p-2.5 px-4 rounded-xl shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Income</span>
            </button>
            <button
              onClick={() => { setIsExpenseFormOpen(true); setFormError(''); }}
              className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] uppercase tracking-wide p-2.5 px-4 rounded-xl shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs bar */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100/70 dark:bg-zinc-900 rounded-2xl w-fit">
        <button onClick={() => setActiveSubTab('balance')} className={getSubTabClass('balance')}>
          Balance Sheet Summary
        </button>
        <button onClick={() => setActiveSubTab('income')} className={getSubTabClass('income')}>
          Income Register ({income.length})
        </button>
        <button onClick={() => setActiveSubTab('expenses')} className={getSubTabClass('expenses')}>
          Expenses Register ({expenses.length})
        </button>
      </div>

      {/* MAIN VIEWPORT PANELS */}

      {/* 1. BALANCE SHEET PANEL */}
      {activeSubTab === 'balance' && (
        <div className="space-y-6">
          
          {/* Main Visual Balance Slate card */}
          <div className="bg-gradient-to-br from-indigo-900 via-zinc-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-5 scale-150 translate-x-12 -translate-y-6 select-none leading-none font-extrabold text-9xl">
              ₹
            </div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x md:divide-indigo-950/20">
              
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-indigo-300 font-bold">Total Aggregated Income</p>
                <h3 className="text-3xl font-extrabold text-emerald-400">+{currencySymbol}{totalIncomeAggregate.toLocaleString()}</h3>
                <p className="text-[10px] text-zinc-400">All registered contributions, donations & plate collections</p>
              </div>

              <div className="md:pl-6 space-y-2">
                <p className="text-xs uppercase tracking-widest text-indigo-300 font-bold">Total Aggregated Expenses</p>
                <h3 className="text-3xl font-extrabold text-red-400">-{currencySymbol}{totalExpensesAggregate.toLocaleString()}</h3>
                <p className="text-[10px] text-zinc-400">Directly spent on poojas, decorations & local hospitality</p>
              </div>

              <div className="md:pl-6 space-y-2">
                <p className="text-xs uppercase tracking-widest text-[#F97316] font-bold">Net Temple Balance (Treasury)</p>
                <h3 className="text-3xl font-black text-indigo-100">{currencySymbol}{netBalance.toLocaleString()}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] bg-rose-500/20 text-indigo-300 px-2 py-0.5 rounded font-black uppercase">
                  Available Treasury Funds
                </span>
              </div>

            </div>
          </div>

          {/* Sponsoring vs Donation side-by-side splits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Income Streams Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 space-y-4 shadow-xs">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Income Sources Split</h4>
              
              <div className="space-y-3">
                
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-55/10 text-emerald-600 flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">Sponsor Contributions</h5>
                      <p className="text-[10px] text-zinc-400">{events.length * 3} sponsoring house instances</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs">{currencySymbol}{sponsorIncomeTotal.toLocaleString()}</span>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-55/10 text-emerald-600 flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">Logged Guest Donations</h5>
                      <p className="text-[10px] text-zinc-400">Arati boxes, special devotees events</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs">{currencySymbol}{totalDonations.toLocaleString()}</span>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-55/10 text-emerald-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">Other Miscellaneous</h5>
                      <p className="text-[10px] text-zinc-400">surplus auction, scrap, rents</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs">{currencySymbol}{totalOtherIncome.toLocaleString()}</span>
                </div>

              </div>
            </div>

            {/* Category Expenses Breakdown Slate list */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 space-y-4 shadow-xs">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Expenses By Category</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                {categories.map((c) => {
                  const spent = categoryExpensesMap[c] || 0;
                  const ratio = totalExpensesAggregate > 0 ? (spent / totalExpensesAggregate) * 100 : 0;

                  return (
                    <div key={c} className="p-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100/50 dark:border-zinc-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">{c}</span>
                        <span className="font-mono font-bold text-[11px] text-zinc-800 dark:text-white">{currencySymbol}{spent}</span>
                      </div>
                      <div className="w-full bg-zinc-200/50 dark:bg-zinc-700 h-1 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full" style={{ width: `${ratio}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. INCOME REGISTER PANEL */}
      {activeSubTab === 'income' && (
        <div className="space-y-4">
          
          {/* Controls filtering bar */}
          <div className="relative bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-xs flex items-center">
            <Search className="absolute left-6 top-5.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search income register by source/sponsor head/notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 border-none rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none"
            />
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-805/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 uppercase tracking-widest text-[9px] font-bold border-b border-zinc-100">
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Source</th>
                  <th className="py-3 px-5">Donor / Sponsor Head</th>
                  <th className="py-3 px-5">Description Notes</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                  {isAdmin && <th className="py-3 px-5">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredIncomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-zinc-55/20 transition-colors">
                    <td className="py-3 px-5 font-medium whitespace-nowrap">{inc.date}</td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inc.source === 'House Sponsor' 
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' 
                          : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                      }`}>
                        {inc.source}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[150px]">{inc.familyHeadName || 'Anonymous Devotee'}</td>
                    <td className="py-3 px-5 text-zinc-500 italic max-w-[200px] truncate">{inc.description || 'N/A'}</td>
                    <td className="py-3 px-5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">+{currencySymbol}{inc.amount}</td>
                    {isAdmin && (
                      <td className="py-3 px-5">
                        <button
                          onClick={() => onDeleteIncome(inc.id)}
                          className="hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded transition text-zinc-400"
                          title="Delete income entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredIncomes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-zinc-400 italic">No income entries logged matching search terms.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 3. EXPENSES REGISTER PANEL */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-4">
          
          {/* Search, Filter bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search expenses by title/description description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-zinc-300"
              />
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-800 p-2 rounded-xl text-xs outline-none focus:border-zinc-300 font-semibold"
              >
                <option value="all">-- All Categories --</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-805/85 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 uppercase tracking-widest text-[9px] font-bold border-b border-zinc-100">
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Expense Title</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Description</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                  {isAdmin && <th className="py-3 px-5">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-zinc-55/20 transition-colors">
                    <td className="py-3 px-5 font-medium whitespace-nowrap">{exp.date}</td>
                    <td className="py-3 px-5 font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">{exp.expenseName}</td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      <span className="bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 px-2.5 py-0.5 rounded text-[10px] font-black uppercase">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-zinc-400 italic max-w-[200px] truncate">{exp.description || 'N/A'}</td>
                    <td className="py-3 px-5 text-right font-black text-rose-600 dark:text-rose-400 font-mono">-{currencySymbol}{exp.amount}</td>
                    {isAdmin && (
                      <td className="py-3 px-5">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded transition text-zinc-400"
                          title="Delete expense entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-zinc-400 italic">No expenditures logged matching category & keywords filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* EXPENSE DIALOG FORM */}
      {isExpenseFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-hidden flex justify-end backdrop-blur-xs">
          
          <div onClick={() => setIsExpenseFormOpen(false)} className="absolute inset-0" />

          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 h-full p-6 flex flex-col space-y-5 shadow-2xl animate-slide-in overflow-y-auto">
            
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-white">Record Saturday Expenditure</h3>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 flex-1">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Expense Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Altar Flowers Garland"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-xs p-2 rounded border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-400 dark:text-zinc-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Expense Category *</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2 rounded border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-400"
                >
                  {categories.map(c => <option key={c} value={c} className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800">{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Amount ({currencySymbol}) *</label>
                <input
                  type="number"
                  min="1"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2 rounded border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Spent Date *</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2 rounded border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Link Saturday Date (Optional)</label>
                <select
                  value={expenseEventId}
                  onChange={(e) => setExpenseEventId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2 rounded border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-400"
                >
                  <option value="" className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800">Standalone General Expense</option>
                  {events.map(e => (
                    <option key={e.id} value={e.date} className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800">{e.date} (Sponsors: {e.sponsors.join(', ')})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Description Notes (Optional)</label>
                <textarea
                  placeholder="Purchased from bazaar, custom receipt logged..."
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2 rounded border border-zinc-200 dark:border-zinc-700 focus:outline-none"
                />
              </div>

              {formError && <div className="text-xs text-red-500 font-bold">{formError}</div>}

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsExpenseFormOpen(false)}
                  className="flex-1 border border-zinc-200 dark:border-zinc-700 p-2 rounded font-bold text-xs uppercase text-zinc-500 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 text-white font-bold text-xs uppercase p-2 rounded hover:bg-red-600"
                >
                  {isSubmitting ? 'Saving...' : 'Add Expense'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* INCOME DIALOG FORM */}
      {isIncomeFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-hidden flex justify-end backdrop-blur-xs">
          
          <div onClick={() => setIsIncomeFormOpen(false)} className="absolute inset-0" />

          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 h-full p-6 flex flex-col space-y-5 shadow-2xl animate-slide-in overflow-y-auto">
            
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-white">Record Standalone Income / Donation</h3>
            </div>

            <form onSubmit={handleAddIncome} className="space-y-4 flex-1">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Income Stream Source *</label>
                <select
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-805 text-zinc-800 dark:text-zinc-200 text-xs p-2 rounded border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-400"
                >
                  <option value="Donation" className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800">Special Donation / Seva Card</option>
                  <option value="Other" className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800">Other Collection / Aarti plate surplus</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Donor Head Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Bhat, Kini family"
                  value={incomeFamilyHead}
                  onChange={(e) => setIncomeFamilyHead(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2 rounded border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Amount Received ({currencySymbol}) *</label>
                <input
                  type="number"
                  min="1"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(Number(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2 rounded border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-405"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Received Date *</label>
                <input
                  type="date"
                  value={incomeDate}
                  onChange={(e) => setIncomeDate(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2 rounded border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-405"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Link Saturday Date (Optional)</label>
                <select
                  value={incomeEventId}
                  onChange={(e) => setIncomeEventId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs p-2 rounded border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-405"
                >
                  <option value="" className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800">General Standalone Income</option>
                  {events.map(e => (
                    <option key={e.id} value={e.date} className="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800">{e.date} (Sponsors: {e.sponsors.join(', ')})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Description Notes (Optional)</label>
                <textarea
                  placeholder="Seva for children birthday anniversary..."
                  value={incomeDesc}
                  onChange={(e) => setIncomeDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-xs p-2 rounded border border-zinc-200 dark:border-zinc-700 focus:outline-none dark:text-zinc-200"
                />
              </div>

              {formError && <div className="text-xs text-red-500 font-bold">{formError}</div>}

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsIncomeFormOpen(false)}
                  className="flex-1 border border-zinc-200 dark:border-zinc-700 p-2 rounded font-bold text-xs uppercase text-zinc-500 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase p-2 rounded"
                >
                  {isSubmitting ? 'Saving...' : 'Add Income'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
