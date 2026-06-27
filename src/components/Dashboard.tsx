import React from 'react';
import { 
  Calendar, 
  Home, 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Mail, 
  UserPlus, 
  Users,
  BellRing,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { House, BhajaneEvent, Expense, Invitation, BillingRecord } from '../types';
import { Language, translations } from '../utils/translations';

interface DashboardProps {
  houses: House[];
  events: BhajaneEvent[];
  expenses: Expense[];
  invitations: Invitation[];
  buildingRecords?: BillingRecord[];
  currencySymbol: string;
  villageName: string;
  templeName: string;
  onNavigate: (tab: string) => void;
  language?: Language;
}

export default function Dashboard({
  houses,
  events,
  expenses,
  invitations,
  buildingRecords = [],
  currencySymbol,
  villageName,
  templeName,
  onNavigate,
  language = 'en'
}: DashboardProps) {
  const t = translations[language];
  
  // 1. Calculate Today & Next Saturday Date
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Calculate nearest upcoming Saturday (could be today if today is Saturday)
  const getNearestSaturdayStr = () => {
    const d = new Date();
    const day = d.getDay(); // 0 is Sunday, 6 is Saturday
    const diff = (6 - day + 7) % 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  };

  const nearestSaturdayStr = getNearestSaturdayStr();
  const isNearestBilled = buildingRecords.some(r => r.date === nearestSaturdayStr);

  // Active upcoming Saturday:
  // Points to nearest Saturday until that Saturday's pooja day billing has been submitted.
  // Once submitted, it rolls over to the next Saturday (7 days later).
  const nextSaturdayDate = isNearestBilled
    ? (() => {
        const d = new Date();
        const day = d.getDay();
        const diff = (6 - day + 7) % 7;
        d.setDate(d.getDate() + diff + 7);
        return d.toISOString().split('T')[0];
      })()
    : nearestSaturdayStr;

  const isBilled = isNearestBilled;

  // 2. Statistics
  const activeHouses = houses.filter(h => h.isActive);
  const totalHousesCount = houses.length;
  
  // Total Income
  const totalIncome = events.reduce((sum, e) => sum + (e.totalIncome || 0), 0);
  
  // Total Expenses
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  
  // Balance
  const remainingBalance = totalIncome - totalExpenses;

  // Building Fund metrics
  const totalBuildingSurplus = buildingRecords.reduce((sum, r) => sum + r.remainingBalance, 0);

  // Sponsoring tithes accumulated across all houses
  const totalSponsorTithes = events.reduce((sum, e) => sum + (e.sponsorIncomeTotal || 0), 0);

  // Active houses for this week (sponsors of the next event)
  const nextEventSponsors = invitations.filter(inv => inv.eventId === nextSaturdayDate && inv.status === 'confirmed');
  
  // Upcoming invitations details
  const upcomingInvs = invitations.filter(inv => inv.eventId === nextSaturdayDate);
  const pendingInvs = upcomingInvs.filter(i => i.status === 'pending');
  const invitedInvs = upcomingInvs.filter(i => i.status === 'invited');
  const confirmedInvs = upcomingInvs.filter(i => i.status === 'confirmed');

  // 3. Chart Data preparation
  // Last 5 events for trend
  const sortedEventsDesc = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const recentEventsData = sortedEventsDesc.slice(-5).map(e => ({
    name: e.date.substring(5), // MM-DD
    Income: e.totalIncome,
    Expenses: e.totalExpenses,
    Balance: e.remainingBalance
  }));

  // Expense by category data for Pie Chart
  const expenseByCategoryMap: Record<string, number> = {};
  expenses.forEach(exp => {
    expenseByCategoryMap[exp.category] = (expenseByCategoryMap[exp.category] || 0) + exp.amount;
  });
  
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#6B7280'];
  const pieChartData = Object.entries(expenseByCategoryMap).map(([category, amount]) => ({
    name: category,
    value: amount
  })).sort((a,b) => b.value - a.value);

  // Notifications logic
  const notifications = [
    {
      id: 'upcoming-sat',
      type: 'info',
      title: 'Upcoming Saturday Bhajane',
      desc: isNearestBilled 
        ? `Pooja Day billing form submitted and locked for Saturday, ${nearestSaturdayStr}.`
        : `Scheduled for Saturday, ${nextSaturdayDate}. Sponsoring contributions set to auto-collect.`,
      icon: <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30'
    },
    {
      id: 'sponsors-status',
      type: isNearestBilled ? 'success' : (nextEventSponsors.length > 0 ? 'success' : 'warning'),
      title: 'House Sponsors Status',
      desc: isNearestBilled
        ? `All sponsoring accounts are settled and locked for this Saturday.`
        : (nextEventSponsors.length > 0 
          ? `We have confirmed ${nextEventSponsors.length} sponsoring house(s) for this week.` 
          : `No sponsoring houses confirmed for next week yet.`),
      icon: <Home className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
      bg: isNearestBilled || nextEventSponsors.length > 0 
        ? 'bg-sky-50 dark:bg-sky-950/10 border-sky-100 dark:border-sky-900/30' 
        : 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30'
    },
    ...pendingInvs.map(inv => ({
      id: `pending-inv-${inv.houseId}`,
      type: 'pending' as const,
      title: `Pending invitation: ${inv.familyHeadName}`,
      desc: `House invitation for next Saturday remains in pending status. Please contact.`,
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      bg: 'bg-orange-50 dark:bg-orange-950/15 border-orange-100 dark:border-orange-900/30'
    })).slice(0, 3)
  ];

  return (
    <div className="space-y-6">
      
      {/* Village and Temple Header Accent */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="absolute right-0 bottom-0 opacity-10 translate-y-6 translate-x-6 scale-150">
          <Calendar className="w-64 h-64" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            🌾 {language === 'kn' ? 'ಸತ್ಸಂಗ ಗ್ರಾಮ ಮಂಡಳಿ' : 'Traditional Village Assembly'}
          </div>
          <h1 id="village-title" className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {templeName || (language === 'kn' ? 'ಶ್ರೀ ಗೋಪಾಲಕೃಷ್ಣ ಭಜನಾ ಮಂದಿರ' : 'Shree Gopalakrishna Bhajana Mandira')}
          </h1>
          <p className="text-amber-100 max-w-xl text-sm md:text-base">
            {t.dashboardSubtitle}
          </p>
          <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs text-amber-50">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{language === 'kn' ? 'ಇಂದು' : 'Today'}: <strong>{new Date().toLocaleDateString(language === 'kn' ? 'kn-IN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{language === 'kn' ? 'ಮುಂಬರುವ ಶನಿವಾರ' : 'Next Bhajane'}: <strong>{nextSaturdayDate} (Saturday)</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        <div className="bg-white dark:bg-zinc-900/80 p-4 md:p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{language === 'kn' ? 'ಮುಂದಿನ ಪ್ರಾಯೋಜಕರು' : 'Next Sponsors'}</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-955/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 id="stat-sponsors" className="text-lg md:text-2xl font-extrabold text-zinc-800 dark:text-white">
              {nextEventSponsors.length} <span className="text-sm font-normal text-zinc-400">{nextEventSponsors.length === 1 ? (language === 'kn' ? 'ಮನೆ' : 'House') : (language === 'kn' ? 'ಮನೆಗಳು' : 'Houses')}</span>
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              {language === 'kn' ? `ದಿನಾಂಕ: ${nextSaturdayDate} ರಂದು` : `Sponsoring on: ${nextSaturdayDate}`}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/80 p-4 md:p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t.totalHouses}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/20 text-[#D97706] dark:text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 id="stat-houses" className="text-lg md:text-2xl font-extrabold text-zinc-800 dark:text-white">
              {totalHousesCount} <span className="text-xs font-normal text-zinc-400">{language === 'kn' ? 'ಸಕ್ರಿಯ' : 'active'}</span>
            </h3>
            <p className="text-[11px] text-[#A16207] dark:text-amber-400 mt-1 font-medium">{language === 'kn' ? 'ಒಟ್ಟು ಪೂಜಾ ನಿಧಿ' : 'Tithes'}: {currencySymbol}{totalSponsorTithes.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/80 p-4 md:p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{language === 'kn' ? 'ಒಟ್ಟು ಆದಾಯ' : 'Total Income'}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-955/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 id="stat-income" className="text-lg md:text-2xl font-extrabold text-zinc-800 dark:text-white">
              {currencySymbol}{totalIncome.toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-0.5 font-medium">
              +{events.length} {language === 'kn' ? 'ಪೂಜಾ ಸಂಗ್ರಹಗಳು' : 'saturday collections'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/80 p-4 md:p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{language === 'kn' ? 'ಒಟ್ಟು ವೆಚ್ಚ' : 'Total Expenses'}</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 id="stat-expenses" className="text-lg md:text-2xl font-extrabold text-zinc-800 dark:text-white">
              {currencySymbol}{totalExpenses.toLocaleString()}
            </h3>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">{language === 'kn' ? 'ದಕ್ಷಿಣೆ, ಅಂಗಡಿ, ಎಣ್ಣೆ ವೆಚ್ಚಗಳು' : 'Poojas, flowers, prasadam, sound'}</p>
          </div>
        </div>

        {/* Pooja Day Billing Card */}
        <div className="bg-white dark:bg-zinc-900/80 p-4 md:p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between cursor-pointer hover:border-orange-200 transition-colors" onClick={() => onNavigate('billing')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{language === 'kn' ? 'ಪೂಜಾ ಬಿಲ್ಲಿಂಗ್ ಆಡಿಟ್' : 'Pooja Day Billing'}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-orange-955/25 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg md:text-2xl font-extrabold text-zinc-800 dark:text-white">
              {buildingRecords.length} <span className="text-xs font-normal text-zinc-400">{language === 'kn' ? 'ವರದಿಗಳು' : 'audits'}</span>
            </h3>
            <p className={`text-[11px] font-bold mt-1 ${totalBuildingSurplus >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-455'}`}>
              Net: {totalBuildingSurplus >= 0 ? '+' : ''}{currencySymbol}{totalBuildingSurplus.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/80 p-4 md:p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{language === 'kn' ? 'ಉಳಿದಿರುವ ಬ್ಯಾಲೆನ್ಸ್' : 'Remaining Balance'}</span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 id="stat-balance" className="text-lg md:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {currencySymbol}{remainingBalance.toLocaleString()}
            </h3>
            <p className="text-[11px] text-sky-600 dark:text-sky-400 mt-1 font-medium">{language === 'kn' ? 'ಖಜಾನೆಯಲ್ಲಿ ಲಭ್ಯವಿರುವ ಬ್ಯಾಲೆನ್ಸ್' : 'Available temple treasury balance'}</p>
          </div>
        </div>

      </div>

      {/* Grid of Notifications vs Invitation Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Notifications and To-Do list */}
        <div className="bg-white dark:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 font-bold text-zinc-800 dark:text-white text-sm uppercase tracking-wider">
              <BellRing className="w-4 h-4 text-amber-500" />
              <span>{t.taskReminders}</span>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded font-black">
              {language === 'kn' ? 'ಲೈವ್ ಫೀಡ್' : 'LIVE Feed'}
            </span>
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className={`flex gap-3 p-3 rounded-xl border ${notif.bg} transition-all`}>
                <div className="mt-0.5 shrink-0">{notif.icon}</div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{notif.title}</h4>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{notif.desc}</p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-6 text-xs text-zinc-400 italic">
                {t.allTasksSettled}
              </div>
            )}
          </div>
        </div>

        {/* Invitations Status Dashboard Card */}
        <div className="bg-white dark:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wide">
              {t.upcomingSponsors} <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-mono">({nextSaturdayDate})</span>
            </h3>
            <button 
              onClick={() => onNavigate('invitations')} 
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 text-xs font-semibold"
            >
              Manage Invitations
            </button>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl flex items-center justify-around gap-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
            <div className="space-y-1">
              <div className="text-amber-500 font-extrabold text-lg">{pendingInvs.length}</div>
              <div className="text-[10px] uppercase">Pending</div>
            </div>
            <div className="h-8 border-r border-zinc-200 dark:border-zinc-700"></div>
            <div className="space-y-1">
              <div className="text-indigo-500 font-extrabold text-lg">{invitedInvs.length}</div>
              <div className="text-[10px] uppercase">Invited</div>
            </div>
            <div className="h-8 border-r border-zinc-200 dark:border-zinc-700"></div>
            <div className="space-y-1">
              <div className="text-emerald-500 font-extrabold text-lg">{confirmedInvs.length}</div>
              <div className="text-[10px] uppercase">Confirmed</div>
            </div>
          </div>

          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {upcomingInvs.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded shrink-0 font-mono">
                      {inv.eventId}
                    </span>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">{inv.familyHeadName}</p>
                  </div>
                  <p className="text-[10px] text-zinc-400 pl-[1px] mt-0.5">{inv.houseName} · {inv.houseId}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  inv.status === 'confirmed' 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                    : inv.status === 'invited'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400'
                    : inv.status === 'cancelled'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-955/20 dark:text-rose-450'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                }`}>
                  {inv.status}
                </span>
              </div>
            ))}
            {upcomingInvs.length === 0 && (
              <div className="text-center py-6 text-xs text-zinc-400 italic">
                No house invitations made yet. Click "Manage Invitations" above to propose some.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Charts and Quick Info Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Savings Trend Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wide">{t.weeklyTrend}</h3>
              <p className="text-xs text-zinc-500">{language === 'kn' ? 'ಒಟ್ಟು ಪೂಜಾ ವಂತಿಗೆ ಮತ್ತು ಖರ್ಚುಗಳ ಹೋಲಿಕೆ' : 'Comparing total collection against spent budget'}</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {recentEventsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentEventsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" className="dark:stroke-zinc-800" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    labelClassName="font-semibold text-xs" 
                  />
                  <Line type="monotone" dataKey="Income" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Expenses" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-xs">
                <AlertCircle className="w-8 h-8 mb-2" />
                No events recorded yet. Click "Weekly Bhajane" to add Saturday entries.
              </div>
            )}
          </div>
        </div>

        {/* Expense share by category Pie Chart */}
        <div className="bg-white dark:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wide">Expense Category Breakdown</h3>
            <p className="text-xs text-zinc-500">Distribution of temple event expenses</p>
          </div>

          <div className="relative h-44 flex items-center justify-center">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${currencySymbol}${value}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-zinc-400 text-xs">No expense categories registered.</div>
            )}
            {pieChartData.length > 0 && (
              <div className="absolute flex flex-col items-center">
                <span className="text-xs text-zinc-400 font-medium">Total Spent</span>
                <span className="text-sm font-bold text-zinc-700 dark:text-white">{currencySymbol}{totalExpenses}</span>
              </div>
            )}
          </div>

          {/* Sliced Legend List */}
          <div className="space-y-1.5 overflow-y-auto max-h-24 pr-1 text-xs">
            {pieChartData.slice(0, 4).map((entry, idx) => (
              <div key={entry.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-zinc-600 dark:text-zinc-300 truncate max-w-[120px]">{entry.name}</span>
                </div>
                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                  {currencySymbol}{entry.value}
                </span>
              </div>
            ))}
            {pieChartData.length > 4 && (
              <p className="text-[10px] text-zinc-400 text-center">and {pieChartData.length - 4} other categories</p>
            )}
          </div>
        </div>

      </div>

      {/* Kairangala Village Houses & Saturday Tithes Registry */}
      <div className="bg-white dark:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-50 dark:border-zinc-800/60 pb-3">
          <div className="inline-flex items-center gap-1.5 font-bold text-zinc-800 dark:text-white text-sm uppercase tracking-wider">
            <Users className="w-4 h-4 text-orange-500" />
            <span>{language === 'kn' ? `${villageName || 'ಕೈರಂಗಳ'} ಗ್ರಾಮದ ಮನೆಗಳ ವಿವರ ಮತ್ತು ವಂತಿಗೆ` : `${villageName || 'Kairangala'} Village Houses Registered & Tithes`}</span>
          </div>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-400 font-bold bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 rounded">
            {language === 'kn' ? 'ಒಟ್ಟು ಮನೆಗಳು' : 'Total Registries'}: <strong className="text-zinc-800 dark:text-zinc-200">{houses.length} {language === 'kn' ? 'ಕುಟುಂಬಗಳು' : 'Families'}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-455 dark:text-zinc-400 uppercase tracking-wider text-[10px] font-black">
                <th className="py-3 px-4">{t.houseId}</th>
                <th className="py-3 px-4">{t.familyHead}</th>
                <th className="py-3 px-4">{t.houseName}</th>
                <th className="py-3 px-4">{language === 'kn' ? 'ಸಂದಾಯವಾದ ಶನಿವಾರ ಕಾಣಿಕೆ' : 'Saturday Tithes Paid'}</th>
                <th className="py-3 px-4 text-center">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-850">
              {houses.map((house) => {
                // Calculate historical sponsor contributions paid by this house
                const houseEvents = events.filter(e => e.sponsors.includes(house.houseId));
                const totalPaid = houseEvents.reduce((sum, e) => sum + e.sponsorContribution, 0);
                const sponsoringCount = houseEvents.length;

                return (
                  <tr key={house.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded text-[10px]">
                        {house.houseId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{house.familyHeadName}</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400">
                      {house.houseName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                        {currencySymbol}{totalPaid}
                        <span className="text-[10px] font-normal text-zinc-400 dark:text-zinc-500 font-sans ml-1.5">
                          ({sponsoringCount} {sponsoringCount === 1 ? (language === 'kn' ? 'ಸೇವೆ' : 'service') : (language === 'kn' ? 'ಸೇವೆಗಳು' : 'services')})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        house.isActive 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                          : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'
                      }`}>
                        {house.isActive ? (language === 'kn' ? 'ಸಕ್ರಿಯ' : 'Active') : (language === 'kn' ? 'ನಿಷ್ಕ್ರಿಯ' : 'Inactive')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
