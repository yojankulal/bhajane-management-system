import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Home, 
  DollarSign, 
  Clock, 
  BarChart4, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle,
  TrendingUp,
  Percent
} from 'lucide-react';
import { House, BhajaneEvent, Expense, Income } from '../types';
import { Language, translations } from '../utils/translations';

interface ReportsProps {
  houses: House[];
  events: BhajaneEvent[];
  expenses: Expense[];
  income: Income[];
  currencySymbol: string;
  villageName: string;
  templeName: string;
  language?: Language;
}

export default function ReportsModule({
  houses,
  events,
  expenses,
  income,
  currencySymbol,
  villageName,
  templeName,
  language = 'en'
}: ReportsProps) {
  const t = translations[language];

  const [reportType, setReportType] = useState<'house' | 'monthly' | 'expense'>('house');

  // Trigger browser print dialog for nice looking vector PDF download
  const handlePrint = () => {
    window.print();
  };

  // 1. CALCULATE HOUSE-WISE ANALYSIS
  const houseContributions = houses.map(house => {
    // Sponsoring events count
    const sponsoredEvents = events.filter(e => e.sponsors.includes(house.houseId));
    const totalSponsorContribution = sponsoredEvents.reduce((sum, e) => sum + e.sponsorContribution, 0);

    // Manual custom donations and incomes logged
    const customIncomes = income.filter(inc => inc.source === 'Donation' && inc.familyHeadName === house.familyHeadName);
    const totalDonationAmount = customIncomes.reduce((sum, i) => sum + i.amount, 0);

    const grandTotalContributed = totalSponsorContribution + totalDonationAmount;

    return {
      ...house,
      sponsoredCount: sponsoredEvents.length,
      sponsoredSum: totalSponsorContribution,
      donationSum: totalDonationAmount,
      totalCashContributed: grandTotalContributed,
      lastSponsoredDate: sponsoredEvents.length > 0 
        ? [...sponsoredEvents].sort((a,b) => b.date.localeCompare(a.date))[0].date 
        : 'Never Sponsored'
    };
  }).sort((a, b) => b.totalCashContributed - a.totalCashContributed);

  // 2. CALCULATE MONTH-WISE ANALYSIS
  // Group events by YYYY-MM
  const monthlyGroups: Record<string, { income: number; expenses: number; eventCount: number; balance: number }> = {};
  
  events.forEach(event => {
    const monthKey = event.date.substring(0, 7); // e.g., "2026-06"
    if (!monthlyGroups[monthKey]) {
      monthlyGroups[monthKey] = { income: 0, expenses: 0, eventCount: 0, balance: 0 };
    }
    monthlyGroups[monthKey].income += event.totalIncome;
    monthlyGroups[monthKey].expenses += event.totalExpenses;
    monthlyGroups[monthKey].balance += event.remainingBalance;
    monthlyGroups[monthKey].eventCount += 1;
  });

  const monthlyReportsList = Object.entries(monthlyGroups).map(([month, data]) => {
    // Format Month humanly, e.g. "June 2026"
    const [year, m] = month.split('-');
    const mIso = new Date(Number(year), Number(m) - 1, 1);
    const monthName = mIso.toLocaleString('default', { month: 'long', year: 'numeric' });

    return {
      monthKey: month,
      monthLabel: monthName,
      ...data
    };
  }).sort((a,b) => b.monthKey.localeCompare(a.monthKey));

  // 3. CATEGORY EXPENSES LIST
  const expenseCategories = [
    'Priest (Pooja)', 'Flowers', 'Coconut', 'Fruits', 'Shop Items', 'Snacks', 'Sound System', 'Decoration', 'Other'
  ];
  
  const totalSpendAmt = expenses.reduce((sum, e) => sum + e.amount, 0);

  const expenseCategoryReports = expenseCategories.map(cat => {
    const list = expenses.filter(exp => exp.category === cat);
    const spentSum = list.reduce((sum, e) => sum + e.amount, 0);
    const percentage = totalSpendAmt > 0 ? (spentSum / totalSpendAmt) * 100 : 0;

    return {
      category: cat,
      spentSum,
      itemCount: list.length,
      percentage
    };
  }).sort((a, b) => b.spentSum - a.spentSum);

  const getButtonClass = (type: typeof reportType) => {
    return `text-xs font-black uppercase tracking-wider py-2 md:py-2.5 px-4 md:px-6 rounded-xl transition ${
      reportType === type 
        ? 'bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 shadow-md' 
        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
    }`;
  };

  return (
    <div className="space-y-6">
      
      {/* Printable CSS style rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">{t.printTitle}</h2>
          <p className="text-xs text-zinc-500">{t.printSubtitle}</p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-600 text-white font-extrabold text-[11px] uppercase tracking-wider p-2.5 px-5 rounded-xl shadow-xs transition"
        >
          <Printer className="w-4 h-4" />
          <span>Export PDF / Print Report</span>
        </button>
      </div>

      {/* Report selectors */}
      <div className="flex items-center gap-1 p-1 bg-zinc-100/70 dark:bg-zinc-900 rounded-2xl w-fit no-print">
        <button onClick={() => setReportType('house')} className={getButtonClass('house')}>
          House Contributions
        </button>
        <button onClick={() => setReportType('monthly')} className={getButtonClass('monthly')}>
          Monthly & Event Summaries
        </button>
        <button onClick={() => setReportType('expense')} className={getButtonClass('expense')}>
          Expense Breakdown
        </button>
      </div>

      {/* REPORT SHEETS PRINT WRAPPER */}
      <div id="printable-report" className="space-y-6">
        
        {/* Printable Header - Visible ONLY in print context or cleanly here */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest block">Bhajane Management System</span>
            <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white uppercase tracking-wide">
              {templeName || 'Shree Gopalakrishna Bhajana Mandira'} Temple Registry
            </h1>
            <p className="text-xs text-zinc-500 font-medium">{villageName || 'Kairangala'} Village · Financial auditing statements</p>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 max-w-xs mx-auto text-[10px] text-zinc-400 font-semibold uppercase">
              Generated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* 1. HOUSE CONRIBUTION REPORT CONTENT */}
        {reportType === 'house' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800/80 overflow-hidden shadow-xs">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-black text-xs uppercase tracking-wider border-b border-zinc-100">
              House-wise Rotational & Sponsor Contribution Audit
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-100/50 dark:bg-zinc-900 border-b border-zinc-200 uppercase tracking-widest text-[9px] font-bold text-zinc-500">
                    <th className="py-3 px-5">House reference</th>
                    <th className="py-3 px-5">Family Head Title</th>
                    <th className="py-3 px-5 text-center">Sponsored Saturday Count</th>
                    <th className="py-3 px-5 text-right font-bold">Rotational cash ({currencySymbol})</th>
                    <th className="py-3 px-5 text-right font-bold">Extra Donations ({currencySymbol})</th>
                    <th className="py-3 px-5 text-right font-mono font-bold">Grand Cash Sum</th>
                    <th className="py-3 px-5">Last Sponsored Saturday</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                  {houseContributions.map((hc) => (
                    <tr key={hc.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-5 font-bold font-mono">{hc.houseId}</td>
                      <td className="py-3 px-5">
                        <strong className="text-zinc-900 dark:text-white font-extrabold">{hc.familyHeadName}</strong>
                        <span className="block text-[10px] text-zinc-400">🏡 {hc.houseName}</span>
                      </td>
                      <td className="py-3 px-5 text-center font-bold">{hc.sponsoredCount} times</td>
                      <td className="py-3 px-5 text-right font-semibold">+{hc.sponsoredSum}</td>
                      <td className="py-3 px-5 text-right text-emerald-600 font-semibold">+{hc.donationSum}</td>
                      <td className="py-3 px-5 text-right font-black text-indigo-600 dark:text-indigo-400">
                        {currencySymbol}{hc.totalCashContributed}
                      </td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          hc.lastSponsoredDate === 'Never Sponsored' ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                        }`}>
                          {hc.lastSponsoredDate}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. MONTHLY SUMMARIES REPORT CONTENT */}
        {reportType === 'monthly' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800/80 overflow-hidden shadow-xs">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-black text-xs uppercase tracking-wider border-b border-zinc-100">
              Monthly Saturday Statements Overview
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-100/50 dark:bg-zinc-900 border-b border-zinc-200 uppercase tracking-widest text-[9px] font-bold text-zinc-500">
                    <th className="py-3 px-5">Billing Month Period</th>
                    <th className="py-3 px-5 text-center">Assemblies Count</th>
                    <th className="py-3 px-5 text-right font-mono text-emerald-600 font-bold">Collections (+ {currencySymbol})</th>
                    <th className="py-3 px-5 text-right font-mono text-rose-600 font-bold">Expenditure (- {currencySymbol})</th>
                    <th className="py-3 px-5 text-right font-mono font-bold">Net Balance Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                  {monthlyReportsList.map((m) => (
                    <tr key={m.monthKey} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                      <td className="py-4 px-5">
                        <strong className="text-zinc-900 dark:text-white font-extrabold text-sm">{m.monthLabel}</strong>
                        <span className="block text-[10px] text-zinc-400">Rotational accounting cycles</span>
                      </td>
                      <td className="py-4 px-5 text-center font-bold text-zinc-600 dark:text-zinc-400">{m.eventCount} Saturdays</td>
                      <td className="py-4 px-5 text-right font-bold text-emerald-600 font-mono">+{m.income.toLocaleString()}</td>
                      <td className="py-4 px-5 text-right font-bold text-rose-500 font-mono">-{m.expenses.toLocaleString()}</td>
                      <td className="py-4 px-5 text-right font-extrabold text-sm leading-none">
                        <div className={`font-mono font-black ${m.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                          {m.balance >= 0 ? '+' : ''}{currencySymbol}{m.balance.toLocaleString()}
                        </div>
                        <span className={`inline-block mt-1.5 text-[8px] uppercase font-black px-1.5 py-0.5 rounded ${
                          m.balance >= 0 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-955/20'
                        }`}>
                          {m.balance >= 0 ? 'Net Profit' : 'Net Loss'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {monthlyReportsList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-zinc-400 italic">No historical months logged in database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. EXPENSE REPORT BREAKDOWN CONTENT */}
        {reportType === 'expense' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left side category share stats */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800/85 overflow-hidden shadow-xs h-fit">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-black text-xs uppercase border-b border-zinc-100 dark:border-zinc-800">
                Audited category summary
              </div>
              <div className="p-4 space-y-4">
                {expenseCategoryReports.map(item => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-zinc-600 dark:text-zinc-300">{item.category} ({item.itemCount} items)</span>
                      <span className="text-zinc-900 dark:text-white">{currencySymbol}{item.spentSum}</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-550 h-full rounded-full" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side individual details itemizations */}
            <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-xs">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-black text-xs uppercase border-b border-zinc-100 dark:border-zinc-800">
                Individual Spent Transactions history ledger
              </div>
              <div className="overflow-x-auto max-h-[480px]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-zinc-100/50 dark:bg-zinc-900/60 uppercase text-[9px] tracking-widest font-bold text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Bill Name</th>
                      <th className="py-3 px-5">Category</th>
                      <th className="py-3 px-4 text-right">Debit amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-600 dark:text-zinc-300">
                    {expenses.map((exp) => (
                      <tr key={exp.id}>
                        <td className="py-3 px-5">{exp.date}</td>
                        <td className="py-3 px-5">
                          <strong className="text-zinc-800 dark:text-white font-extrabold">{exp.expenseName}</strong>
                          {exp.description && <span className="block text-[10px] text-zinc-400 italic font-normal">{exp.description}</span>}
                        </td>
                        <td className="py-3 px-5">
                          <span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-rose-600 font-mono text-sm">
                          -{currencySymbol}{exp.amount}
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-10 text-zinc-400">No outstanding expense entries.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
