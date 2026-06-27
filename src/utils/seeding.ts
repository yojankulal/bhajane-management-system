import { collection, getDocs, addDoc, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { House, BhajaneEvent, Expense, Income, Invitation } from '../types';

export const SAMPLE_HOUSES: Omit<House, 'id'>[] = [
  { houseId: 'H-01', familyHeadName: 'Manjunatha Hegde', houseName: 'Mane-1', phone: '9845012345', address: 'Pooja Circle, Kairangala', notes: 'Active bhajan singer', isActive: true },
  { houseId: 'H-02', familyHeadName: 'Ganesha Bhat', houseName: 'Pratibha Nilaya', phone: '9845023456', address: 'Near Gopalakrishna Temple', notes: 'Always hosts priests', isActive: true },
  { houseId: 'H-03', familyHeadName: 'Anantha Rao', houseName: 'Srinivasa Kripa', phone: '9448056711', address: 'Main Road Crossroads', notes: 'Harmonium player', isActive: true },
  { houseId: 'H-04', familyHeadName: 'Shashidhara Naik', houseName: 'Ganga Nilaya', phone: '9900123456', address: 'Riverbed Lane 2', notes: 'Has large hall space', isActive: true },
  { houseId: 'H-05', familyHeadName: 'Venkatesha Kini', houseName: 'Kini Mansion', phone: '9741033221', address: 'Bazaar Street', notes: 'Regular donor', isActive: true },
  { houseId: 'H-06', familyHeadName: 'Suresh Shenoy', houseName: 'Gokula', phone: '9880124578', address: 'Temple North Gate', notes: 'Volunteers for setup', isActive: true },
  { houseId: 'H-07', familyHeadName: 'Rajendra Prasad', houseName: 'Saraswathi Nilaya', phone: '9945033772', address: 'School Road', notes: 'Sings kirtans', isActive: true },
  { houseId: 'H-08', familyHeadName: 'Subraya Bhat', houseName: 'Guru Kripa', phone: '9449015799', address: 'Bhat compound', notes: 'Tablist accompaniment', isActive: true },
  { houseId: 'H-09', familyHeadName: 'Mohandas Pai', houseName: 'Durga Prasad', phone: '9845099887', address: 'Post Office Road', notes: 'Arranges flower plates', isActive: true },
  { houseId: 'H-10', familyHeadName: 'Shankara Narayana', houseName: 'Shiva Prasad', phone: '9481012345', address: 'Hilltop corner', notes: 'Provides sound system sometimes', isActive: true },
  { houseId: 'H-11', familyHeadName: 'Nagesh Rao', houseName: 'Anugraha', phone: '9880111222', address: 'Near Old School', notes: 'Coordinates youth volunteers', isActive: true },
  { houseId: 'H-12', familyHeadName: 'Raghavendra Acharya', houseName: 'Aishwarya', phone: '9902345678', address: 'Car Street Kairangala', notes: 'Prepares traditional prasad', isActive: true }
];

export const SAMPLE_EVENTS: BhajaneEvent[] = [
  {
    id: '2026-05-30',
    date: '2026-05-30',
    sponsors: ['H-01', 'H-02', 'H-03'],
    sponsorContribution: 250,
    sponsorIncomeTotal: 750,
    donations: 800,
    otherIncome: 150,
    totalIncome: 1700,
    totalExpenses: 850,
    remainingBalance: 850,
    notes: 'Very first Bhajane of the month. Good attendance.'
  },
  {
    id: '2026-06-06',
    date: '2026-06-06',
    sponsors: ['H-04', 'H-05', 'H-06'],
    sponsorContribution: 250,
    sponsorIncomeTotal: 750,
    donations: 1200,
    otherIncome: 0,
    totalIncome: 1950,
    totalExpenses: 1100,
    remainingBalance: 850,
    notes: 'Special flowers decorations sponsored by Kini family.'
  },
  {
    id: '2026-06-13',
    date: '2026-06-13',
    sponsors: ['H-07', 'H-08', 'H-09'],
    sponsorContribution: 250,
    sponsorIncomeTotal: 750,
    donations: 550,
    otherIncome: 200,
    totalIncome: 1500,
    totalExpenses: 720,
    remainingBalance: 780,
    notes: 'Raining heavily, conducted inside temple main hall.'
  },
  {
    id: '2026-06-20', // Last Saturday relative to June 21, 2026
    date: '2026-06-20',
    sponsors: ['H-10', 'H-11', 'H-12'],
    sponsorContribution: 250,
    sponsorIncomeTotal: 750,
    donations: 950,
    otherIncome: 100,
    totalIncome: 1800,
    totalExpenses: 950,
    remainingBalance: 850,
    notes: 'Monthly special bhajane with grand prasad distribution.'
  }
];

export const SAMPLE_EXPENSES: Omit<Expense, 'id'>[] = [
  // Expenses for 2026-05-30
  { eventId: '2026-05-30', expenseName: 'Satyanarayana Pooja Priest', category: 'Priest (Pooja)', amount: 400, description: 'Priest Sambhavana', date: '2026-05-30' },
  { eventId: '2026-05-30', expenseName: 'Roses & Jasmine Garland', category: 'Flowers', amount: 150, description: 'Deity flower garlands', date: '2026-05-30' },
  { eventId: '2026-05-30', expenseName: 'Coconuts', category: 'Coconut', amount: 100, description: '3 coconuts for kalash and prasad', date: '2026-05-30' },
  { eventId: '2026-05-30', expenseName: 'Kesaribath Sweets', category: 'Snacks', amount: 200, description: 'Prasad sweets distribution', date: '2026-05-30' },

  // Expenses for 2026-06-06
  { eventId: '2026-06-06', expenseName: 'Weekly Pooja Priest Fee', category: 'Priest (Pooja)', amount: 300, description: 'Alankara Puja', date: '2026-06-06' },
  { eventId: '2026-06-06', expenseName: 'Grand Flower decoration', category: 'Decoration', amount: 350, description: 'Full altar marigold garlands', date: '2026-06-06' },
  { eventId: '2026-06-06', expenseName: 'Bananas & Mangos', category: 'Fruits', amount: 150, description: 'Pooja offering fruits', date: '2026-06-06' },
  { eventId: '2026-06-06', expenseName: 'Coconuts & Camphor', category: 'Coconut', amount: 120, description: 'Pooja essentials', date: '2026-06-06' },
  { eventId: '2026-06-06', expenseName: 'Incense and Oil', category: 'Shop Items', amount: 180, description: 'Temple store items', date: '2026-06-06' },

  // Expenses for 2026-06-13
  { eventId: '2026-06-13', expenseName: 'Weekly Priest Service', category: 'Priest (Pooja)', amount: 300, description: 'Arati and archana', date: '2026-06-13' },
  { eventId: '2026-06-13', expenseName: 'Temple Flowers', category: 'Flowers', amount: 120, description: 'Simple garlands', date: '2026-06-13' },
  { eventId: '2026-06-13', expenseName: 'Samosa & Tea', category: 'Snacks', amount: 300, description: 'For bhajan singers and devotees', date: '2026-06-13' },

  // Expenses for 2026-06-20
  { eventId: '2026-06-20', expenseName: 'Priest Special Pooja Dakshina', category: 'Priest (Pooja)', amount: 400, description: 'Monthly grand pooja', date: '2026-06-20' },
  { eventId: '2026-06-20', expenseName: 'Altar Flowers & Garland', category: 'Flowers', amount: 200, description: 'Decoration flowers', date: '2026-06-20' },
  { eventId: '2026-06-20', expenseName: 'Kairangala Sound System', category: 'Sound System', amount: 250, description: 'Amplifier & mic rent', date: '2026-06-20' },
  { eventId: '2026-06-20', expenseName: 'Puliyogare & Payasam', category: 'Snacks', amount: 100, description: 'Mahaprasadam preparation groceries', date: '2026-06-20' }
];

export const SAMPLE_INCOME_RECORDS: Omit<Income, 'id'>[] = [
  { eventId: '2026-05-30', source: 'House Sponsor', amount: 250, description: 'Sponsorship - Mane-1', familyHeadName: 'Manjunatha Hegde', date: '2026-05-30' },
  { eventId: '2026-05-30', source: 'House Sponsor', amount: 250, description: 'Sponsorship - Pratibha Nilaya', familyHeadName: 'Ganesha Bhat', date: '2026-05-30' },
  { eventId: '2026-05-30', source: 'House Sponsor', amount: 250, description: 'Sponsorship - Srinivasa Kripa', familyHeadName: 'Anantha Rao', date: '2026-05-30' },
  { eventId: '2026-05-30', source: 'Donation', amount: 500, description: 'Special Seva offering', familyHeadName: 'Venkatesha Kini', date: '2026-05-30' },
  { eventId: '2026-05-30', source: 'Donation', amount: 300, description: 'Anonymous', familyHeadName: 'Walk-in Devotee', date: '2026-05-30' },
  { eventId: '2026-05-30', source: 'Other', amount: 150, description: 'Aarti Plate Collection', date: '2026-05-30' },

  { eventId: '2026-06-06', source: 'House Sponsor', amount: 250, description: 'Sponsorship - Ganga Nilaya', familyHeadName: 'Shashidhara Naik', date: '2026-06-06' },
  { eventId: '2026-06-06', source: 'House Sponsor', amount: 250, description: 'Sponsorship - Kini Mansion', familyHeadName: 'Venkatesha Kini', date: '2026-06-06' },
  { eventId: '2026-06-06', source: 'House Sponsor', amount: 250, description: 'Sponsorship - Gokula', familyHeadName: 'Suresh Shenoy', date: '2026-06-06' },
  { eventId: '2026-06-06', source: 'Donation', amount: 1200, description: 'Family birth anniversary Seva', familyHeadName: 'Subraya Bhat', date: '2026-06-06' },

  { eventId: '2026-06-13', source: 'House Sponsor', amount: 250, description: 'Sponsorship - Saraswathi Nilaya', familyHeadName: 'Rajendra Prasad', date: '2026-06-13' },
  { eventId: '2026-06-13', source: 'House Sponsor', amount: 250, description: 'Sponsorship - Guru Kripa', familyHeadName: 'Subraya Bhat', date: '2026-06-13' },
  { eventId: '2026-06-13', source: 'House Sponsor', amount: 250, description: 'Sponsorship - Durga Prasad', familyHeadName: 'Mohandas Pai', date: '2026-06-13' },
  { eventId: '2026-06-13', source: 'Donation', amount: 550, description: 'Arati collection', date: '2026-06-13' },
  { eventId: '2026-06-13', source: 'Other', amount: 200, description: 'Coconut auction sale', date: '2026-06-13' },

  { eventId: '2026-06-20', source: 'House Sponsor', amount: 250, description: 'Sponsorship - Shiva Prasad', familyHeadName: 'Shankara Narayana', date: '2026-06-20' },
  { eventId: '2026-06-20', source: 'House Sponsor', amount: 250, description: 'Sponsorship - Anugraha', familyHeadName: 'Nagesh Rao', date: '2026-06-20' },
  { eventId: '2026-06-20', source: 'House Sponsor', amount: 250, description: 'Sponsorship - Aishwarya', familyHeadName: 'Raghavendra Acharya', date: '2026-06-20' },
  { eventId: '2026-06-20', source: 'Donation', amount: 800, description: 'Weekly prasad sponsor extra', familyHeadName: 'Anantha Rao', date: '2026-06-20' },
  { eventId: '2026-06-20', source: 'Donation', amount: 150, description: 'Kanike box collection', date: '2026-06-20' },
  { eventId: '2026-06-20', source: 'Other', amount: 100, description: 'Pooja material sold surplus', date: '2026-06-20' }
];

export const SAMPLE_INVITATIONS: Invitation[] = [
  // For the next weekend "2026-06-27"
  { id: '2026-06-27_H-01', eventId: '2026-06-27', houseId: 'H-01', familyHeadName: 'Manjunatha Hegde', houseName: 'Mane-1', status: 'confirmed', notes: 'Agreed to be next sponsor' },
  { id: '2026-06-27_H-02', eventId: '2026-06-27', houseId: 'H-02', familyHeadName: 'Ganesha Bhat', houseName: 'Pratibha Nilaya', status: 'invited', notes: 'Invited by committee member' },
  { id: '2026-06-27_H-03', eventId: '2026-06-27', houseId: 'H-03', familyHeadName: 'Anantha Rao', houseName: 'Srinivasa Kripa', status: 'pending', notes: 'Attempted to call - phone busy' },
  { id: '2026-06-27_H-04', eventId: '2026-06-27', houseId: 'H-04', familyHeadName: 'Shashidhara Naik', houseName: 'Ganga Nilaya', status: 'pending', notes: 'Needs invitation card' }
];

export async function seedDatabaseIfEmpty(force = false) {
  const querySnapshot = await getDocs(collection(db, 'houses'));
  if (querySnapshot.size > 0 && !force) {
    console.log('Database already has houses. Skipping seed.');
    return false;
  }

  console.log('Seeding Bhajane Management System collections...');
  const batch = writeBatch(db);

  // 1. Seed Settings
  const settingsRef = doc(db, 'settings', 'global');
  await setDoc(settingsRef, {
    defaultContribution: 250,
    currency: '₹',
    villageName: 'Kairangala',
    templeName: 'Shree Gopalakrishna Bhajana Mandira',
    priestName: 'Shri Venkatraman Bhat'
  });

  // Since we cannot use writeBatch for adding random ID and simultaneously getting reference unless we generate them,
  // we can use standard promise calls or generate document IDs manually.
  // Let's create Houses using custom IDs matching their houseId
  for (const house of SAMPLE_HOUSES) {
    const houseDocRef = doc(db, 'houses', house.houseId);
    await setDoc(houseDocRef, house);
  }

  // Seed Events
  for (const event of SAMPLE_EVENTS) {
    const eventDocRef = doc(db, 'events', event.id);
    await setDoc(eventDocRef, event);
  }

  // Seed Expenses
  const expensesColRef = collection(db, 'expenses');
  for (const exp of SAMPLE_EXPENSES) {
    await addDoc(expensesColRef, exp);
  }

  // Seed Income
  const incomeColRef = collection(db, 'income');
  for (const inc of SAMPLE_INCOME_RECORDS) {
    await addDoc(incomeColRef, inc);
  }

  // Seed Invitations
  for (const inv of SAMPLE_INVITATIONS) {
    const invDocRef = doc(db, 'invitations', inv.id);
    await setDoc(invDocRef, inv);
  }

  console.log('Successfully seeded database with beautiful sample data!');
  return true;
}
