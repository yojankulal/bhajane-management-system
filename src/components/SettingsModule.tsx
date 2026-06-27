import React, { useState } from 'react';
import { 
  Settings, 
  Coins, 
  Map, 
  Sparkles, 
  Check, 
  HelpCircle, 
  Building,
  UserCheck,
  Award,
  AlertTriangle,
  Plus,
  Trash2,
  Shield,
  Loader2
} from 'lucide-react';
import { SystemSettings } from '../types';
import { Language, translations } from '../utils/translations';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface SettingsProps {
  settings: SystemSettings;
  isAdmin: boolean;
  onUpdateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  language?: Language;
}

export default function SettingsModule({
  settings,
  isAdmin,
  onUpdateSettings,
  language = 'en'
}: SettingsProps) {
  const t = translations[language];

  // Form states initialized with props
  const [defaultCont, setDefaultCont] = useState<number>(settings.defaultContribution);
  const [currency, setCurrency] = useState(settings.currency);
  const [village, setVillage] = useState(settings.villageName);
  const [temple, setTemple] = useState(settings.templeName);
  const [priest, setPriest] = useState(settings.priestName);

  // Status updates
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Allowed emails state
  const [allowedEmails, setAllowedEmails] = useState<{ id: string; email: string }[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [isEmailAdding, setIsEmailAdding] = useState(false);

  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, 'allowed_emails'), (snapshot) => {
      const list = snapshot.docs.map(d => ({
        id: d.id,
        email: d.data().email || d.id
      }));
      setAllowedEmails(list);
    }, (err) => {
      console.warn("Error fetching allowed emails (probably not logged in yet):", err);
    });
    return () => unsub();
  }, []);

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    const cleanEmail = newEmail.trim().toLowerCase();
    
    if (!cleanEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    setIsEmailAdding(true);
    try {
      const docRef = doc(db, 'allowed_emails', cleanEmail);
      await setDoc(docRef, {
        email: cleanEmail,
        addedAt: new Date().toISOString(),
        addedBy: 'Admin'
      });
      setNewEmail('');
    } catch (err) {
      console.error("Failed to add allowed email:", err);
      alert("Error adding email: Make sure you are signed in as an administrator.");
    } finally {
      setIsEmailAdding(false);
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    if (emailId === 'dyojan100@gmail.com') {
      alert('The superuser email dyojan100@gmail.com is permanently authorized and cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to revoke edit permissions for ${emailId}?`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'allowed_emails', emailId));
    } catch (err) {
      console.error("Failed to delete allowed email:", err);
      alert("Error revoking permission: Make sure you have administrator rights.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSuccess(false);

    if (!isAdmin) {
      setErrorMsg('Forbidden: Authentic configuration changes are restricted to authorized admins. Sign in first.');
      return;
    }

    try {
      await onUpdateSettings({
        defaultContribution: Number(defaultCont),
        currency: currency.trim() || '₹',
        villageName: village.trim() || 'Kairangala',
        templeName: temple.trim() || 'Shree Gopalakrishna Bhajana Mandira',
        priestName: priest.trim() || ''
      });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update global variables.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">{t.settingsTitle}</h2>
        <p className="text-xs text-zinc-500">{t.settingsSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Form Frame */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Settings className="w-5 h-5 text-amber-500 hover:rotate-45 transition-transform" />
            <h3 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wide">{t.configureConstants}</h3>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wide">Default Contribution rate *</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={defaultCont}
                    onChange={(e) => setDefaultCont(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wide">Currency symbol (e.g. ₹ or $) *</label>
                <input
                  type="text"
                  maxLength={3}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wide">Village Assembly Name *</label>
              <input
                type="text"
                placeholder="e.g. Kairangala"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wide">Deity / Temple Circle *</label>
              <input
                type="text"
                placeholder="e.g. Shree Gopalakrishna Bhajana Mandira"
                value={temple}
                onChange={(e) => setTemple(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wide">Priest Name reference (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Sri Venkatraman Bhat"
                value={priest}
                onChange={(e) => setPriest(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none"
              />
            </div>

            {errorMsg && <div className="p-3 bg-red-100 text-red-800 text-xs font-bold rounded-lg">{errorMsg}</div>}
            {isSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border-emerald-100 border text-xs font-semibold rounded-lg flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-500 animate-bounce" />
                <span>Global constants successfully saved! Change propagated everywhere.</span>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-500 dark:text-zinc-950 font-black text-xs uppercase p-3 px-6 rounded-xl shadow tracking-wide transition"
              >
                Save Settings Configuration
              </button>
            </div>

          </form>
        </div>

        {/* Settings Right Column */}
        <div className="space-y-6">
          
          {/* Allowed Emails Management Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <h4 className="text-xs font-bold text-zinc-800 dark:text-white uppercase tracking-wider">{t.manageAllowedEmails}</h4>
            </div>

            <p className="leading-relaxed text-[11px] text-zinc-500 dark:text-zinc-400">
              {t.allowedEmailsSubtitle}
            </p>

            {/* Allowed emails list */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {allowedEmails.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-855 border border-zinc-100 dark:border-zinc-800 text-[11px] font-semibold"
                >
                  <span className="text-zinc-700 dark:text-zinc-300 font-mono select-all truncate max-w-[150px]">
                    {item.email}
                  </span>
                  {item.email === 'dyojan100@gmail.com' ? (
                    <span className="text-[9px] uppercase tracking-wider bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-md font-bold">
                      Superuser
                    </span>
                  ) : (
                    isAdmin && (
                      <button
                        onClick={() => handleDeleteEmail(item.id)}
                        className="text-red-500 hover:text-red-750 p-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition"
                        title="Remove authorized email"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )
                  )}
                </div>
              ))}
              {allowedEmails.length === 0 && (
                <div className="text-center py-4 text-xs text-zinc-400 font-medium">
                  Loading administrator emails...
                </div>
              )}
            </div>

            {/* Form to add allowed emails */}
            {isAdmin ? (
              <form onSubmit={handleAddEmail} className="flex gap-2 pt-1">
                <input
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-750 focus:outline-none"
                  disabled={isEmailAdding}
                />
                <button
                  type="submit"
                  disabled={isEmailAdding || !newEmail.trim()}
                  className="bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-500 dark:text-zinc-950 p-2 rounded-lg text-white font-bold transition disabled:opacity-40 shrink-0"
                >
                  {isEmailAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </button>
              </form>
            ) : (
              <div className="text-[10px] text-zinc-400 italic bg-zinc-50 dark:bg-zinc-855 p-2 rounded-lg text-center">
                🔒 {t.onlyAdminsCanManageAllowedEmails}
              </div>
            )}
          </div>

          {/* Quick Manual help */}
          <div className="bg-amber-50 dark:bg-amber-950/15 border border-amber-250/20 rounded-xl p-4 text-xs text-amber-850 dark:text-amber-310 leading-relaxed font-medium">
            💡 <strong>Authorized Write Access:</strong> Access is restricted to authorized Gmail addresses listed in the panel above. Log in with an authorized email to activate edit permissions.
          </div>

        </div>

      </div>

    </div>
  );
}
