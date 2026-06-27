export interface House {
  id: string; // Firestore Doc ID
  houseId: string; // Searchable unique text code (e.g. "H-101")
  familyHeadName: string;
  houseName: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt?: any;
}

export type ExpenseCategory =
  | 'Priest (Pooja)'
  | 'Flowers'
  | 'Coconut'
  | 'Fruits'
  | 'Shop Items'
  | 'Snacks'
  | 'Sound System'
  | 'Decoration'
  | 'Other';

export interface Expense {
  id: string;
  eventId?: string; // Links to specific BhajaneEvent (optional, can be standalone)
  expenseName: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  date: string; // YYYY-MM-DD
}

export interface Income {
  id: string;
  eventId?: string; // Optional links to event
  source: string; // e.g. "House Sponsor", "Donation", "Other"
  amount: number;
  description?: string;
  familyHeadName?: string; // If sponsored or donated by someone
  date: string; // YYYY-MM-DD
}

export type InvitationStatus = 'pending' | 'invited' | 'confirmed' | 'cancelled';

export interface Invitation {
  id: string; // Typically YYYY-MM-DD_houseId
  eventId: string; // YYYY-MM-DD (next target date)
  houseId: string; // House ID refering to House.id
  familyHeadName: string;
  houseName: string;
  status: InvitationStatus;
  notes?: string;
  updatedAt?: any;
}

export interface BhajaneEvent {
  id: string; // YYYY-MM-DD or standard auto ID
  date: string; // YYYY-MM-DD (mostly Saturdays)
  sponsors: string[]; // List of House ID strings (typically 3)
  sponsorContribution: number; // default is ₹250 (editable during event creation)
  sponsorIncomeTotal: number; // calculated sponsor contributions (sponsors.length * sponsorContribution)
  donations: number; // extra donations received this event
  otherIncome: number; // other sources
  totalIncome: number; // Calculated: (sponsorIncomeTotal + donations + otherIncome)
  totalExpenses: number; // Calculated of expenses linked to this event
  remainingBalance: number; // (totalIncome - totalExpenses)
  notes?: string;
  priestExpenses?: number; // priest/pooja dakshina spent during saturday service
  shopExpenses?: number; // shop goods & oil/groceries purchased for saturday service
}

export interface SystemSettings {
  defaultContribution: number;
  currency: string;
  villageName: string;
  templeName: string;
  priestName: string;
}

export interface BillingSponsorInfo {
  houseId: string;
  familyHeadName: string;
  houseName: string;
  contribution: number;
}

export interface BillingRecord {
  id: string; // Firestore Doc ID or generated (e.g. date)
  date: string; // YYYY-MM-DD
  sponsors: BillingSponsorInfo[]; // The houses sponsoring on that date
  sponsorContributionTotal: number; // Sum of sponsor contributions
  shopExpenses: number; // shop goods, oil, ghee, etc.
  priestExpenses: number; // money given to priest (dakshina)
  otherCollections: number; // small cash counters 10, 20 rupees, except sponsors
  otherExpenses: number; // optional general overall expenses
  totalIncome: number; // sponsorContributionTotal + otherCollections
  totalExpenses: number; // shopExpenses + priestExpenses + otherExpenses
  remainingBalance: number; // totalIncome - totalExpenses
  notes?: string;
  createdAt?: any;
}

