import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  CalendarDays, 
  Mail, 
  History, 
  FilePieChart, 
  Settings as SettingsIcon, 
  Search, 
  Moon, 
  Sun, 
  Menu, 
  X,
  Sparkles,
  RefreshCcw,
  CheckCircle2,
  Database,
  UserCheck,
  Building,
  Receipt
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { db, auth } from './firebase';
import { House, BhajaneEvent, Expense, Income, Invitation, SystemSettings, InvitationStatus, BillingRecord } from './types';
import { seedDatabaseIfEmpty } from './utils/seeding';
import { Language, translations, translateHouse, translateInvitation, translateBillingRecord, translateIncome, translateExpense } from './utils/translations';

// Components
import Dashboard from './components/Dashboard';
import HouseManagement from './components/HouseManagement';
import WeeklyBhajane from './components/WeeklyBhajane';
import BillingManagement from './components/BillingManagement';
import InvitationManagement from './components/InvitationManagement';
import HistoryModule from './components/HistoryModule';
import ReportsModule from './components/ReportsModule';
import SettingsModule from './components/SettingsModule';
import GlobalSearch from './components/GlobalSearch';
import LoginPage from './components/LoginPage';

type Tab = 'dashboard' | 'houses' | 'weekly' | 'billing' | 'invitations' | 'history' | 'reports' | 'settings' | 'search';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'kn' ? 'kn' : 'en') as Language;
  });

  const t = translations[language];

  // Auth context state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Firestore standard lists
  const [houses, setHouses] = useState<House[]>([]);
  const [events, setEvents] = useState<BhajaneEvent[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    defaultContribution: 250,
    currency: '₹',
    villageName: 'Kairangala',
    templeName: 'Shree Gopalakrishna Bhajana Mandira',
    priestName: 'Shri Venkatraman Bhat'
  });

  const [dbLoading, setDbLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast Trigger Helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Observe Auth state
  const [authChecking, setAuthChecking] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        setAuthChecking(true);
        setAuthError(null);
        try {
          const emailLower = user.email.toLowerCase();
          const emailDocRef = doc(db, 'allowed_emails', emailLower);
          const emailDocSnap = await getDoc(emailDocRef);
          
          if (emailDocSnap.exists() || emailLower === 'dyojan100@gmail.com') {
            // Authorized
            setCurrentUser(user);
            
            // Auto-create doc in Firestore for dyojan100@gmail.com if not exists
            if (emailLower === 'dyojan100@gmail.com' && !emailDocSnap.exists()) {
              await setDoc(emailDocRef, {
                email: emailLower,
                addedAt: new Date().toISOString(),
                addedBy: 'System (Superuser)'
              });
            }
          } else {
            // Unauthorized - sign out immediately
            await auth.signOut();
            setCurrentUser(null);
            setAuthError(translations[language].unauthorizedEmail || 'This email address is not in the allowed administrators list.');
            showToast('Access denied: Email address is not in the allowed administrators list.');
          }
        } catch (error) {
          console.error("Error checking user authorization:", error);
          await auth.signOut();
          setCurrentUser(null);
          setAuthError('Error validating authorization. Please try again.');
        } finally {
          setAuthChecking(false);
        }
      } else {
        setCurrentUser(null);
        setAuthChecking(false);
      }
    });
    return () => unsub();
  }, [language]);

  // Sync real-time collections from Firebase Firestore
  useEffect(() => {
    setDbLoading(true);

    // 1. Settings Snapshot
    const settingsRef = doc(db, 'settings', 'global');
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SystemSettings;
        const needsUpdate = 
          !data.templeName || 
          data.templeName === 'Sri Rama Mandira' || 
          data.templeName === 'Sri Rama Temple' || 
          data.templeName === 'Shri Rama Mandira' ||
          !data.villageName ||
          data.villageName === 'Shanthipura';

        const updatedSettings: SystemSettings = {
          ...data,
          templeName: needsUpdate ? 'Shree Gopalakrishna Bhajana Mandira' : data.templeName,
          villageName: needsUpdate ? 'Kairangala' : data.villageName
        };

        setSettings(updatedSettings);

        if (needsUpdate && auth.currentUser) {
          setDoc(settingsRef, updatedSettings)
            .then(() => console.log("Successfully auto-migrated template settings in Firestore."))
            .catch((err) => console.warn("Auto-save of settings failed:", err));
        }
      } else {
        // Create initial settings if not defined ONLY if user is signed in
        if (auth.currentUser) {
          setDoc(settingsRef, {
            defaultContribution: 250,
            currency: '₹',
            villageName: 'Kairangala',
            templeName: 'Shree Gopalakrishna Bhajana Mandira',
            priestName: 'Shri Venkatraman Bhat'
          }).catch((err) => console.warn("Could not save initial settings:", err));
        } else {
          console.log("No settings document found in Firestore. Using offline-safe app defaults.");
        }
      }
    }, (error) => {
      console.warn("Settings fetch error (possibly permissions/cold-start):", error);
    });

    // 2. Houses list
    const unsubHouses = onSnapshot(collection(db, 'houses'), (snap) => {
      const housesList: House[] = [];
      snap.forEach(docSnap => {
        housesList.push({ id: docSnap.id, ...docSnap.data() } as House);
      });
      // Sort alphabetically/numerically
      housesList.sort((a,b) => a.houseId.localeCompare(b.houseId));
      setHouses(housesList);
      setDbLoading(false);
    }, (error) => {
      console.error("Houses fetch error:", error);
    });

    // 3. Events list
    const unsubEvents = onSnapshot(collection(db, 'events'), (snap) => {
      const eventsList: BhajaneEvent[] = [];
      snap.forEach(docSnap => {
        eventsList.push({ id: docSnap.id, ...docSnap.data() } as BhajaneEvent);
      });
      setEvents(eventsList);
    });

    // 4. Expenses list
    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snap) => {
      const expList: Expense[] = [];
      snap.forEach(docSnap => {
        expList.push({ id: docSnap.id, ...docSnap.data() } as Expense);
      });
      setExpenses(expList);
    });

    // 5. Income list
    const unsubIncome = onSnapshot(collection(db, 'income'), (snap) => {
      const incList: Income[] = [];
      snap.forEach(docSnap => {
        incList.push({ id: docSnap.id, ...docSnap.data() } as Income);
      });
      setIncome(incList);
    });

    // 6. Invitations list
    const unsubInvitations = onSnapshot(collection(db, 'invitations'), (snap) => {
      const invsList: Invitation[] = [];
      snap.forEach(docSnap => {
        invsList.push({ id: docSnap.id, ...docSnap.data() } as Invitation);
      });
      setInvitations(invsList);
    });

    // 7. Billing records list
    const unsubBilling = onSnapshot(collection(db, 'billing_records'), (snap) => {
      const bList: BillingRecord[] = [];
      snap.forEach(docSnap => {
        bList.push({ id: docSnap.id, ...docSnap.data() } as BillingRecord);
      });
      bList.sort((a, b) => b.date.localeCompare(a.date));
      setBillingRecords(bList);
    });

    return () => {
      unsubSettings();
      unsubHouses();
      unsubEvents();
      unsubExpenses();
      unsubIncome();
      unsubInvitations();
      unsubBilling();
    };
  }, []);

  // Memoized translated lists for localized rendering
  const translatedHouses = React.useMemo(() => {
    return houses.map(h => translateHouse(h, language));
  }, [houses, language]);

  const translatedInvitations = React.useMemo(() => {
    return invitations.map(i => translateInvitation(i, language));
  }, [invitations, language]);

  const translatedBillingRecords = React.useMemo(() => {
    return billingRecords.map(b => translateBillingRecord(b, language));
  }, [billingRecords, language]);

  const translatedIncome = React.useMemo(() => {
    return income.map(inc => translateIncome(inc, language));
  }, [income, language]);

  const translatedExpenses = React.useMemo(() => {
    return expenses.map(e => translateExpense(e, language));
  }, [expenses, language]);

  // Seeding trigger function
  const triggerDatabaseSeed = async (force = false) => {
    try {
      const seeded = await seedDatabaseIfEmpty(force);
      if (seeded) {
        showToast('Successfully seeded database with village records.');
      } else {
        showToast('Database is already seeded with records.');
      }
    } catch (e: any) {
      showToast(`Error seeding: ${e?.message}`);
    }
  };

  // Core Mutation handlers (Write operators with auth validation checks)

  // 1. HOUSE OPERATIONS
  const handleAddHouse = async (newHouse: Omit<House, 'id'>) => {
    // We set doc explicitly with key houseId to keep it unique
    const houseDocRef = doc(db, 'houses', newHouse.houseId);
    await setDoc(houseDocRef, newHouse);
    showToast(`Registered house profile: ${newHouse.familyHeadName}`);
  };

  const handleUpdateHouse = async (id: string, updates: Partial<House>) => {
    const houseDocRef = doc(db, 'houses', id);
    await updateDoc(houseDocRef, updates);
    showToast(`Updated house profile: ${updates.familyHeadName || id}`);
  };

  const handleDeleteHouse = async (id: string) => {
    const houseDocRef = doc(db, 'houses', id);
    await deleteDoc(houseDocRef);
    showToast('Deleted house profile.');
  };

  // 2. SATURDAY EVENT LOGGER
  const handleAddEvent = async (event: Omit<BhajaneEvent, 'id'>) => {
    // Add event doc
    const eventDocRef = doc(db, 'events', event.date);
    await setDoc(eventDocRef, event);

    // Cascading operations:
    // Create separate income entries for sponsors
    for (const sponsorId of event.sponsors) {
      const matchedHouse = houses.find(h => h.houseId === sponsorId);
      await addDoc(collection(db, 'income'), {
        eventId: event.date,
        source: 'House Sponsor',
        amount: event.sponsorContribution,
        description: `Saturday rotational sponsor - ${event.date}`,
        familyHeadName: matchedHouse?.familyHeadName || sponsorId,
        date: event.date
      });

      // Update current target invitations to confirmed
      const invDocRef = doc(db, 'invitations', `${event.date}_${sponsorId}`);
      await setDoc(invDocRef, {
        eventId: event.date,
        houseId: sponsorId,
        familyHeadName: matchedHouse?.familyHeadName || sponsorId,
        houseName: matchedHouse?.houseName || sponsorId,
        status: 'confirmed' as const,
        notes: 'Sponsorship collected successfully.',
        updatedAt: new Date()
      });
    }

    // Log extra donations
    if (event.donations > 0) {
      await addDoc(collection(db, 'income'), {
        eventId: event.date,
        source: 'Donation',
        amount: event.donations,
        description: `Guest plate & Kanike surplus collections for ${event.date}`,
        date: event.date
      });
    }

    // Log other income
    if (event.otherIncome > 0) {
      await addDoc(collection(db, 'income'), {
        eventId: event.date,
        source: 'Other',
        amount: event.otherIncome,
        description: `Coconut surplus auctioned or misc incomes - ${event.date}`,
        date: event.date
      });
    }

    // Log priest expenses if added directly during Saturday nighttime budgeting
    if (event.priestExpenses && event.priestExpenses > 0) {
      await addDoc(collection(db, 'expenses'), {
        eventId: event.date,
        expenseName: 'Priest Pooja (Saturday Service)',
        category: 'Priest (Pooja)' as const,
        amount: event.priestExpenses,
        description: `Dakshina & priest service charges for ${event.date}`,
        date: event.date
      });
    }

    // Log shop/grocery expenses if added directly during Saturday nighttime budgeting
    if (event.shopExpenses && event.shopExpenses > 0) {
      await addDoc(collection(db, 'expenses'), {
        eventId: event.date,
        expenseName: 'Pooja Shop Items',
        category: 'Shop Items' as const,
        amount: event.shopExpenses,
        description: `Ghee, oil, camphor, coconuts, or items purchased from shop for ${event.date}`,
        date: event.date
      });
    }

    showToast(`Saved Saturday service: ${event.date}`);
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteDoc(doc(db, 'events', id));

    // Cleanup cascading incomes for this Saturday date
    const incomeQuery = query(collection(db, 'income'), where('eventId', '==', id));
    const incomeSnapshot = await getDocs(incomeQuery);
    incomeSnapshot.forEach(async (docSnap) => {
      await deleteDoc(doc(db, 'income', docSnap.id));
    });

    // Cleanup cascading expenses for this Saturday date
    const expenseQuery = query(collection(db, 'expenses'), where('eventId', '==', id));
    const expenseSnapshot = await getDocs(expenseQuery);
    expenseSnapshot.forEach(async (docSnap) => {
      await deleteDoc(doc(db, 'expenses', docSnap.id));
    });

    showToast('Deleted Saturday records & cleared transaction logs.');
  };

  // 3. TRANSACTIONS & TRANSFERS
  const handleAddExpense = async (newExpense: Omit<Expense, 'id'>) => {
    const docRef = await addDoc(collection(db, 'expenses'), newExpense);

    // If linked to specific Saturday event, update its totals dynamically
    if (newExpense.eventId) {
      const eventDocRef = doc(db, 'events', newExpense.eventId);
      const eventDoc = await getDoc(eventDocRef);
      if (eventDoc.exists()) {
        const data = eventDoc.data() as BhajaneEvent;
        const totalExpenses = (data.totalExpenses || 0) + newExpense.amount;
        const remainingBalance = data.totalIncome - totalExpenses;
        await updateDoc(eventDocRef, {
          totalExpenses,
          remainingBalance
        });
      }
    }
    showToast(`Recorded expenditures: ${newExpense.expenseName}`);
  };

  const handleDeleteExpense = async (id: string) => {
    const expenseRef = doc(db, 'expenses', id);
    const expenseDoc = await getDoc(expenseRef);
    if (expenseDoc.exists()) {
      const data = expenseDoc.data() as Expense;
      if (data.eventId) {
        // Adjust linked event totals
        const eventDocRef = doc(db, 'events', data.eventId);
        const eventDoc = await getDoc(eventDocRef);
        if (eventDoc.exists()) {
          const evData = eventDoc.data() as BhajaneEvent;
          const totalExpenses = Math.max(0, (evData.totalExpenses || 0) - data.amount);
          const remainingBalance = evData.totalIncome - totalExpenses;
          await updateDoc(eventDocRef, {
            totalExpenses,
            remainingBalance
          });
        }
      }
    }
    await deleteDoc(expenseRef);
    showToast('Cleared expenditure.');
  };

  const handleAddIncome = async (newIncome: Omit<Income, 'id'>) => {
    await addDoc(collection(db, 'income'), newIncome);

    // Update linked event totals if applicable
    if (newIncome.eventId) {
      const eventDocRef = doc(db, 'events', newIncome.eventId);
      const eventDoc = await getDoc(eventDocRef);
      if (eventDoc.exists()) {
        const data = eventDoc.data() as BhajaneEvent;
        const totalIncome = (data.totalIncome || 0) + newIncome.amount;
        const remainingBalance = totalIncome - (data.totalExpenses || 0);
        await updateDoc(eventDocRef, {
          totalIncome,
          remainingBalance
        });
      }
    }
    showToast(`Recorded income: ${newIncome.source}`);
  };

  const handleDeleteIncome = async (id: string) => {
    const incomeRef = doc(db, 'income', id);
    const incomeDoc = await getDoc(incomeRef);
    if (incomeDoc.exists()) {
      const data = incomeDoc.data() as Income;
      if (data.eventId) {
        const eventDocRef = doc(db, 'events', data.eventId);
        const eventDoc = await getDoc(eventDocRef);
        if (eventDoc.exists()) {
          const evData = eventDoc.data() as BhajaneEvent;
          const totalIncome = Math.max(0, (evData.totalIncome || 0) - data.amount);
          const remainingBalance = totalIncome - (evData.totalExpenses || 0);
          await updateDoc(eventDocRef, {
            totalIncome,
            remainingBalance
          });
        }
      }
    }
    await deleteDoc(incomeRef);
    showToast('Cleared income.');
  };

  // 4. INVITATIONS HANDLER
  const handleSetInvitationStatus = async (
    house: House,
    eventId: string,
    status: InvitationStatus,
    notes?: string
  ) => {
    const key = `${eventId}_${house.houseId}`;
    const invRef = doc(db, 'invitations', key);
    await setDoc(invRef, {
      id: key,
      eventId,
      houseId: house.houseId,
      familyHeadName: house.familyHeadName,
      houseName: house.houseName,
      status,
      notes: notes || '',
      updatedAt: new Date()
    });
  };

  const handleDeleteInvitation = async (eventId: string, houseId: string) => {
    const key = `${eventId}_${houseId}`;
    await deleteDoc(doc(db, 'invitations', key));
    showToast('Removed house sponsor invitation for this day.');
  };

  // 5. GLOBAL CONFIGURATION SAVER
  const handleUpdateSettings = async (updates: Partial<SystemSettings>) => {
    const settingsRef = doc(db, 'settings', 'global');
    await updateDoc(settingsRef, updates);
    showToast('Global settings variables updated!');
  };

  // 6. BILLING LEDGER RECORD OPERATIONS
  const handleAddBillingRecord = async (record: Omit<BillingRecord, 'id'> & { id?: string }) => {
    const docId = record.date;
    
    // De-duplicate previous bookkeeping linked entries
    const billingEventId = `${record.date}_billing`;
    
    const incomeQuery = query(collection(db, 'income'), where('eventId', '==', billingEventId));
    const incomeSnapshot = await getDocs(incomeQuery);
    for (const docSnap of incomeSnapshot.docs) {
      await deleteDoc(doc(db, 'income', docSnap.id));
    }

    const expenseQuery = query(collection(db, 'expenses'), where('eventId', '==', billingEventId));
    const expenseSnapshot = await getDocs(expenseQuery);
    for (const docSnap of expenseSnapshot.docs) {
      await deleteDoc(doc(db, 'expenses', docSnap.id));
    }

    // Lock & log billing document
    await setDoc(doc(db, 'billing_records', docId), record);

    // Cascade: IndividualSponsors -> Income
    for (const sponsor of record.sponsors) {
      if (sponsor.contribution > 0) {
        await addDoc(collection(db, 'income'), {
          eventId: billingEventId,
          source: 'Billing House Sponsor',
          amount: sponsor.contribution,
          description: `Sponsor: ${sponsor.familyHeadName} (${sponsor.houseId})`,
          familyHeadName: sponsor.familyHeadName,
          date: record.date
        });
      }
    }

    // Cascade: Other collections -> Income
    if (record.otherCollections > 0) {
      await addDoc(collection(db, 'income'), {
        eventId: billingEventId,
        source: 'Billing Coins / Kanike',
        amount: record.otherCollections,
        description: `Kanike plate offerings on Pooja day ${record.date}`,
        date: record.date
      });
    }

    // Cascade: Priest dakshina -> Expenses
    if (record.priestExpenses > 0) {
      await addDoc(collection(db, 'expenses'), {
        eventId: billingEventId,
        expenseName: 'Priest Pooja Dakshina',
        category: 'Priest (Pooja)' as const,
        amount: record.priestExpenses,
        description: `Priest dakshina / payments on Pooja day ${record.date}`,
        date: record.date
      });
    }

    // Cascade: Shop grocery expenses -> Expenses
    if (record.shopExpenses > 0) {
      await addDoc(collection(db, 'expenses'), {
        eventId: billingEventId,
        expenseName: 'Pooja Shop Items',
        category: 'Shop Items' as const,
        amount: record.shopExpenses,
        description: `Grocery, oil, camphor, coconut - Pooja day ${record.date}`,
        date: record.date
      });
    }

    // Cascade: Other supplemental expenses -> Expenses
    if (record.otherExpenses > 0) {
      await addDoc(collection(db, 'expenses'), {
        eventId: billingEventId,
        expenseName: 'Pooja Supplemental Expenses',
        category: 'Other' as const,
        amount: record.otherExpenses,
        description: `Other overall costs - Pooja day ${record.date}`,
        date: record.date
      });
    }

    showToast(`Recorded Billing ledger for date: ${record.date}`);
  };

  const handleDeleteBillingRecord = async (id: string) => {
    await deleteDoc(doc(db, 'billing_records', id));

    const billingEventId = `${id}_billing`;

    // Cascading delete across incomes
    const incomeQuery = query(collection(db, 'income'), where('eventId', '==', billingEventId));
    const incomeSnapshot = await getDocs(incomeQuery);
    for (const docSnap of incomeSnapshot.docs) {
      await deleteDoc(doc(db, 'income', docSnap.id));
    }

    // Cascading delete across expenses
    const expenseQuery = query(collection(db, 'expenses'), where('eventId', '==', billingEventId));
    const expenseSnapshot = await getDocs(expenseQuery);
    for (const docSnap of expenseSnapshot.docs) {
      await deleteDoc(doc(db, 'expenses', docSnap.id));
    }

    showToast('Deleted Billing Record & cleared linked cash transfers.');
  };

  // Auth role check - must be declared before navigationItems
  const isAdmin = currentUser !== null;

  // Navigation Links array
  // Guest users (not signed in) see only: dashboard, houses, invitations, history, reports
  // Admin users (signed in) see everything
  const guestNavItems = [
    { id: 'dashboard', name: t.dashboard, icon: <Home className="w-4 h-4" /> },
    { id: 'houses', name: t.housesRegister, icon: <Users className="w-4 h-4" /> },
    { id: 'invitations', name: t.invitations, icon: <Mail className="w-4 h-4" /> },
    { id: 'history', name: t.saturdaysHistory, icon: <History className="w-4 h-4" /> },
    { id: 'reports', name: t.printStatements, icon: <FilePieChart className="w-4 h-4" /> },
  ] as const;

  const adminNavItems = [
    { id: 'dashboard', name: t.dashboard, icon: <Home className="w-4 h-4" /> },
    { id: 'houses', name: t.housesRegister, icon: <Users className="w-4 h-4" /> },
    { id: 'billing', name: t.pujaDayBilling, icon: <Receipt className="w-4 h-4" /> },
    { id: 'invitations', name: t.invitations, icon: <Mail className="w-4 h-4" /> },
    { id: 'history', name: t.saturdaysHistory, icon: <History className="w-4 h-4" /> },
    { id: 'reports', name: t.printStatements, icon: <FilePieChart className="w-4 h-4" /> },
    { id: 'search', name: t.masterSearch, icon: <Search className="w-4 h-4" /> },
    { id: 'settings', name: t.settings, icon: <SettingsIcon className="w-4 h-4" /> },
  ] as const;

  const navigationItems = isAdmin ? adminNavItems : guestNavItems;


  // Guard: if guest tries to access admin-only tabs, reset to dashboard
  const adminOnlyTabs = ['billing', 'weekly', 'search', 'settings'];
  React.useEffect(() => {
    if (!isAdmin && adminOnlyTabs.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [isAdmin, activeTab]);

  return (
    <div className={`min-h-screen font-sans flex flex-col ${darkTheme ? 'dark bg-zinc-950 text-zinc-50' : 'bg-slate-50 text-zinc-900'}`}>
      
      {/* Toast Alert overlay notifications */}
      {toastMessage && (
        <div id="toast-banner" className="fixed top-20 right-6 z-50 bg-zinc-900 border border-zinc-750 text-zinc-100 p-4 px-6 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Rail */}
      <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 sticky top-0 z-40 shadow-xs no-print">
        
        {/* Left branding */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-white text-md shadow shadow-orange-500/20 border border-[#ed0707]">
              🪔
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider leading-none text-[#f4f4f5]">
                Bhajane Management
              </h1>
              <span className="text-[10px] text-zinc-400 font-bold block mt-0.5">{settings.villageName} Village</span>
            </div>
          </div>
        </div>

        {/* Right side details (Login, Theme, Search) */}
        <div className="flex items-center gap-3">
          
          {/* Language selection control */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200/50 dark:border-zinc-700/40 text-[10px] font-black tracking-wider select-none">
            <button
              onClick={() => {
                setLanguage('en');
                localStorage.setItem('app_language', 'en');
                showToast('Language changed to English');
              }}
              className={`px-2 py-1 rounded-lg transition-all uppercase ${language === 'en' ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'}`}
            >
              EN
            </button>
            <button
              onClick={() => {
                setLanguage('kn');
                localStorage.setItem('app_language', 'kn');
                showToast('ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ');
              }}
              className={`px-2 py-1 rounded-lg transition-all ${language === 'kn' ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs font-bold text-[10px]' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'}`}
            >
              ಕನ್ನಡ
            </button>
          </div>

          <LoginPage onUserUpdate={setCurrentUser} currentUser={currentUser} authError={authError} authChecking={authChecking} />

          {/* Theme mode toggle */}
          <button
            onClick={() => setDarkTheme(!darkTheme)}
            className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/85 transition-colors rounded-xl text-zinc-500 dark:text-zinc-300"
            title="Toggle theme color mode"
          >
            {darkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

      </header>

      {/* Main Structural Frame container */}
      <div className="flex flex-1">
        
        {/* SIDEBAR NAVIGATION (Desktop size layout) */}
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-zinc-900 border-r border-slate-100 dark:border-zinc-800/80 p-5 space-y-7 shrink-0 no-print">
          
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-400">Interactive Map</span>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-zinc-500 font-semibold">{settings.templeName || 'Shree Gopalakrishna Bhajana Mandira'}</span>
            </div>
          </div>

          <nav className="space-y-1 bg-white dark:bg-zinc-900">
            {navigationItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all uppercase tracking-wide border border-transparent select-none ${
                    active 
                      ? 'bg-zinc-950 text-white font-bold border-zinc-800 dark:bg-amber-500 dark:text-zinc-950 dark:border-transparent pointer-events-none text-left' 
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:text-zinc-400 text-left'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-zinc-800/50 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>Role: {isAdmin ? 'Authorized Admin' : 'Guest Viewer'}</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-normal">
              Logged in admins possess direct edit rights in Firestore. Unauthenticated guests can view but not edit records.
            </p>
          </div>

        </aside>

        {/* MOBILE SIDEBAR DRAWSER (Triggered) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex no-print">
            <div onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-xs" />
            
            <div className="relative w-64 bg-white dark:bg-zinc-900 h-full p-5 space-y-6 flex flex-col shadow-2xl animate-slide-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-3">
                <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">Navigation Menu</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1 flex-1">
                {navigationItems.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 font-semibold text-xs py-2.5 px-4 rounded-xl transition uppercase tracking-wide ${
                        active 
                          ? 'bg-zinc-950 text-white font-bold dark:bg-amber-500 dark:text-zinc-950 text-left' 
                          : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 text-left'
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-zinc-400">
                Role: {isAdmin ? 'Admin' : 'Guest'} · Village: {settings.villageName}
              </div>
            </div>
          </div>
        )}

        {/* VIEWPORT AREA FRAME */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-full">
          
          {dbLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400 space-y-3">
              <RefreshCcw className="w-8 h-8 animate-spin text-orange-500" />
              <p className="text-xs font-semibold uppercase tracking-wider">Retrieving real-time local temple books...</p>
              <div className="max-w-xs text-center text-[10px] leading-relaxed text-zinc-400 font-medium">
                Establishing handshake with Firestore databases. If this takes longer, make sure internet remains connected.
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Dynamic Tab router views */}
              {activeTab === 'dashboard' && (
                <Dashboard 
                  houses={translatedHouses} 
                  events={events} 
                  expenses={translatedExpenses} 
                  invitations={translatedInvitations} 
                  buildingRecords={translatedBillingRecords as any}
                  currencySymbol={settings.currency} 
                  villageName={settings.villageName}
                  templeName={settings.templeName}
                  onNavigate={(tab) => setActiveTab(tab as Tab)}
                  language={language}
                />
              )}

              {activeTab === 'houses' && (
                <HouseManagement 
                  houses={translatedHouses} 
                  isAdmin={isAdmin}
                  onAddHouse={handleAddHouse}
                  onUpdateHouse={handleUpdateHouse}
                  onDeleteHouse={handleDeleteHouse}
                  language={language}
                />
              )}

              {activeTab === 'weekly' && (
                <WeeklyBhajane 
                  houses={translatedHouses} 
                  events={events} 
                  defaultContribution={settings.defaultContribution}
                  isAdmin={isAdmin}
                  currencySymbol={settings.currency}
                  onAddEvent={handleAddEvent}
                  onDeleteEvent={handleDeleteEvent}
                  language={language}
                />
              )}

              {activeTab === 'billing' && (
                <BillingManagement 
                  houses={translatedHouses}
                  invitations={translatedInvitations}
                  billingRecords={translatedBillingRecords}
                  isAdmin={isAdmin}
                  currencySymbol={settings.currency}
                  onAddBillingRecord={handleAddBillingRecord}
                  onDeleteBillingRecord={handleDeleteBillingRecord}
                  language={language}
                />
              )}

              {activeTab === 'invitations' && (
                <InvitationManagement 
                  houses={translatedHouses} 
                  invitations={translatedInvitations} 
                  events={events}
                  billingRecords={translatedBillingRecords}
                  isAdmin={isAdmin}
                  onSetInvitationStatus={handleSetInvitationStatus}
                  onDeleteInvitation={handleDeleteInvitation}
                  language={language}
                />
              )}

              {activeTab === 'history' && (
                <HistoryModule 
                  events={events} 
                  expenses={translatedExpenses} 
                  income={translatedIncome} 
                  invitations={translatedInvitations}
                  currencySymbol={settings.currency} 
                  isAdmin={isAdmin}
                  onDeleteEvent={handleDeleteEvent}
                  language={language}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsModule 
                  houses={translatedHouses} 
                  events={events} 
                  expenses={translatedExpenses} 
                  income={translatedIncome} 
                  currencySymbol={settings.currency} 
                  villageName={settings.villageName}
                  templeName={settings.templeName}
                  language={language}
                />
              )}

              {activeTab === 'search' && (
                <GlobalSearch 
                  houses={translatedHouses} 
                  events={events} 
                  expenses={translatedExpenses} 
                  invitations={translatedInvitations} 
                  currencySymbol={settings.currency}
                  onNavigate={(tab) => setActiveTab(tab as Tab)}
                  language={language}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsModule 
                  settings={settings} 
                  isAdmin={isAdmin}
                  onUpdateSettings={handleUpdateSettings}
                  language={language}
                />
              )}

            </div>
          )}

        </main>

      </div>

    </div>
  );
}
