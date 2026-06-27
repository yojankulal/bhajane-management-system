export type Language = 'en' | 'kn';

export interface TranslationDictionary {
  // Navigation
  dashboard: string;
  housesRegister: string;
  weeklySaturdays: string;
  pujaDayBilling: string;
  invitations: string;
  saturdaysHistory: string;
  printStatements: string;
  masterSearch: string;
  settings: string;

  // Common UI
  language: string;
  save: string;
  cancel: string;
  add: string;
  edit: string;
  delete: string;
  search: string;
  actions: string;
  status: string;
  notes: string;
  date: string;
  amount: string;
  total: string;
  loading: string;
  success: string;
  error: string;
  back: string;
  confirm: string;
  villageName: string;
  templeName: string;
  priestName: string;

  // Dashboard
  dashboardTitle: string;
  dashboardSubtitle: string;
  totalHouses: string;
  activeHouses: string;
  nextSaturdayEvent: string;
  pendingTasks: string;
  upcomingSponsors: string;
  weeklyTrend: string;
  recentHistory: string;
  viewAll: string;
  noEvents: string;
  taskReminders: string;
  allTasksSettled: string;

  // Houses
  housesTitle: string;
  housesSubtitle: string;
  addHouse: string;
  editHouse: string;
  houseId: string;
  familyHead: string;
  houseName: string;
  phone: string;
  address: string;
  isActive: string;
  searchHousesPlaceholder: string;
  noHousesFound: string;

  // Weekly Saturdays
  weeklyTitle: string;
  weeklySubtitle: string;
  createEvent: string;
  selectDate: string;
  selectSponsors: string;
  contributionPerSponsor: string;
  extraDonations: string;
  otherIncome: string;
  priestExpenses: string;
  shopExpenses: string;
  otherExpenses: string;
  recordBilling: string;

  // Puja Day Billing
  billingTitle: string;
  billingSubtitle: string;
  sponsorContributions: string;
  otherCollections: string;
  coinKanike: string;
  totalRevenue: string;
  netMargin: string;
  noSponsorsRegistered: string;

  // Invitations
  invitationsTitle: string;
  invitationsSubtitle: string;
  sendInvitation: string;
  statusPending: string;
  statusInvited: string;
  statusConfirmed: string;
  statusCancelled: string;
  changeStatus: string;
  inviteSponsor: string;

  // Saturdays History
  historyTitle: string;
  historySubtitle: string;
  historyDescription: string;

  // Print Statements
  printTitle: string;
  printSubtitle: string;
  printDescription: string;
  generateReport: string;
  downloadPDF: string;
  printView: string;

  // Settings
  settingsTitle: string;
  settingsSubtitle: string;
  configureConstants: string;
  defaultContributionRate: string;
  currencySymbol: string;
  dbOperations: string;
  unauthorizedEmail: string;
  manageAllowedEmails: string;
  addAllowedEmail: string;
  emailPlaceholder: string;
  allowedEmailsSubtitle: string;
  onlyAdminsCanManageAllowedEmails: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    dashboard: "Dashboard",
    housesRegister: "Houses Register",
    weeklySaturdays: "Weekly Saturdays",
    pujaDayBilling: "Puja Day Billing",
    invitations: "Invitations",
    saturdaysHistory: "Saturdays History",
    printStatements: "Print Statements",
    masterSearch: "Master Search",
    settings: "Settings",

    language: "Language",
    save: "Save",
    cancel: "Cancel",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    actions: "Actions",
    status: "Status",
    notes: "Notes",
    date: "Date",
    amount: "Amount",
    total: "Total",
    loading: "Loading...",
    success: "Success",
    error: "Error",
    back: "Back",
    confirm: "Confirm",
    villageName: "Village Name",
    templeName: "Temple Name",
    priestName: "Priest Name",

    dashboardTitle: "Satsang & Bhajane Dashboard",
    dashboardSubtitle: "Monitor village house registers, upcoming Saturday puja schedules, and track mandira ledgers dynamically.",
    totalHouses: "Total Registered Houses",
    activeHouses: "Active Mandira Houses",
    nextSaturdayEvent: "Next Saturday Event",
    pendingTasks: "Pending Tasks Today",
    upcomingSponsors: "Upcoming Saturday Sponsors",
    weeklyTrend: "Weekly Saturday's Financial Trend",
    recentHistory: "Recent Saturdays History",
    viewAll: "View All",
    noEvents: "No Saturdays recorded yet. Plan a puja in Weekly Saturdays tab!",
    taskReminders: "Saturday Task Reminders",
    allTasksSettled: "All tasks settled! No pending tasks for the upcoming event.",

    housesTitle: "Mandira House Register",
    housesSubtitle: "Add, modify, and manage village households, contact reference codes, and search family details.",
    addHouse: "Register New House",
    editHouse: "Edit House Details",
    houseId: "House ID",
    familyHead: "Family Head Name",
    houseName: "House / Family Name",
    phone: "Phone Number",
    address: "Address",
    isActive: "Active Sponsor Status",
    searchHousesPlaceholder: "Search by Head Name, House Name, or ID (e.g. H-101)...",
    noHousesFound: "No houses found matching your query.",

    weeklyTitle: "Weekly Saturday Puja",
    weeklySubtitle: "Schedule upcoming Saturday events, allocate sponsors, manage contributions, and plan expenses.",
    createEvent: "Schedule Puja Event",
    selectDate: "Select Puja Date",
    selectSponsors: "Select Event Sponsors",
    contributionPerSponsor: "Contribution per Sponsor",
    extraDonations: "Extra Donations / Cash Kanike",
    otherIncome: "Other Receipts (Ghee, Oil, General)",
    priestExpenses: "Priest Pooja Dakshina",
    shopExpenses: "Shop Items (Oil, Camphor, Coconut)",
    otherExpenses: "Other Expenses",
    recordBilling: "Record Event Billing",

    billingTitle: "Puja Day Billing",
    billingSubtitle: "Auto-load confirmed invitations as sponsors, modify individual contributions, register coin Kanike plate cash, and track overall margins.",
    sponsorContributions: "Sponsor Contributions",
    otherCollections: "Other Collections",
    coinKanike: "Coin Kanike Plate Cash",
    totalRevenue: "Total Revenue Collected",
    netMargin: "Net Remaining Balance",
    noSponsorsRegistered: "No sponsors registered. Select a date to populate.",

    invitationsTitle: "Sponsor Invitations",
    invitationsSubtitle: "Draft weekly Saturday puja invitations, assign houses, and track confirmed sponsors for upcoming weekends.",
    sendInvitation: "Draft Invitation Request",
    statusPending: "Pending",
    statusInvited: "Invited",
    statusConfirmed: "Confirmed",
    statusCancelled: "Cancelled",
    changeStatus: "Change Status",
    inviteSponsor: "Invite Sponsor",

    historyTitle: "Saturdays History Ledger",
    historySubtitle: "A complete chronological timeline of past weekly Saturday pujas, collections, and expenses incurred.",
    historyDescription: "Historical Saturday Puja records",

    printTitle: "Financial Statements",
    printSubtitle: "Generate, preview, and print formal audit statements of weekly Saturday collections and expenses.",
    printDescription: "Formal audit statement of collections and expenses",
    generateReport: "Generate Report",
    downloadPDF: "Print Ledger Statement",
    printView: "Print / PDF View",

    settingsTitle: "System Settings",
    settingsSubtitle: "Amend default Contribution configurations, currency codes, and general identities of the module.",
    configureConstants: "Configure Global Constants",
    defaultContributionRate: "Default Contribution Rate",
    currencySymbol: "Currency Symbol",
    dbOperations: "Database Operations",
    unauthorizedEmail: "This email address is not in the allowed administrators list.",
    manageAllowedEmails: "Allowed Administrator Emails",
    addAllowedEmail: "Add Allowed Email",
    emailPlaceholder: "Enter Gmail address (e.g., example@gmail.com)",
    allowedEmailsSubtitle: "Specify who can sign in and modify/edit the village Bhajane system.",
    onlyAdminsCanManageAllowedEmails: "Manage authorized Google accounts with edit permissions.",
  },
  kn: {
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    housesRegister: "ಮನೆಗಳ ನೋಂದಣಿ",
    weeklySaturdays: "ವಾರದ ಶನಿವಾರ ಪೂಜೆ",
    pujaDayBilling: "ಪೂಜಾ ದಿನದ ಬಿಲ್ಲಿಂಗ್",
    invitations: "ಆಮಂತ್ರಣಗಳು",
    saturdaysHistory: "ಶನಿವಾರಗಳ ಇತಿಹಾಸ",
    printStatements: "ಹೇಳಿಕೆಗಳ ಮುದ್ರಣ",
    masterSearch: "ಮಾಸ್ಟರ್ ಹುಡುಕಾಟ",
    settings: "ಸೆಟ್ಟಿಂಗ್ಸ್",

    language: "ಭಾಷೆ",
    save: "ಉಳಿಸಿ",
    cancel: "ರದ್ದುಮಾಡಿ",
    add: "ಸೇರಿಸಿ",
    edit: "ತಿದ್ದುಪಡಿ",
    delete: "ಅಳಿಸಿ",
    search: "ಹುಡುಕು",
    actions: "ಕ್ರಮಗಳು",
    status: "ಸ್ಥಿತಿ",
    notes: "ಟಿಪ್ಪಣಿಗಳು",
    date: "ದಿನಾಂಕ",
    amount: "ಮೊತ್ತ",
    total: "ಒಟ್ಟು",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    success: "ಯಶಸ್ವಿಯಾಗಿದೆ",
    error: "ದೋಷ",
    back: "ಹಿಂದಕ್ಕೆ",
    confirm: "ಖಚಿತಪಡಿಸಿ",
    villageName: "ಗ್ರಾಮದ ಹೆಸರು",
    templeName: "ದೇವಸ್ಥಾನದ ಹೆಸರು",
    priestName: "ಅರ್ಚಕರ ಹೆಸರು",

    dashboardTitle: "ಸತ್ಸಂಗ ಮತ್ತು ಭಜನಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    dashboardSubtitle: "ಗ್ರಾಮದ ಮನೆ ನೋಂದಣಿ, ಮುಂಬರುವ ಶನಿವಾರದ ಪೂಜಾ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಮಂದಿರದ ಲೆಡ್ಜರ್ ಅನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.",
    totalHouses: "ಒಟ್ಟು ನೋಂದಾಯಿತ ಮನೆಗಳು",
    activeHouses: "ಸಕ್ರಿಯ ಮಂದಿರ ಮನೆಗಳು",
    nextSaturdayEvent: "ಮುಂಬರುವ ಶನಿವಾರದ ಪೂಜೆ",
    pendingTasks: "ಇಂದಿನ ಬಾಕಿ ಕಾರ್ಯಗಳು",
    upcomingSponsors: "ಮುಂಬರುವ ಶನಿವಾರದ ಪ್ರಾಯೋಜಕರು (ಸೇವಾಕರ್ತರು)",
    weeklyTrend: "ವಾರದ ಶನಿವಾರ ಪೂಜೆಯ ಹಣಕಾಸು ಪ್ರವೃತ್ತಿ",
    recentHistory: "ಇತ್ತೀಚಿನ ಶನಿವಾರಗಳ ಇತಿಹಾಸ",
    viewAll: "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
    noEvents: "ಯಾವುದೇ ಶನಿವಾರದ ಪೂಜೆಗಳು ದಾಖಲಾಗಿಲ್ಲ. ವಾರದ ಶನಿವಾರ ಪೂಜೆಯ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಹೊಸ ಪೂಜೆಯನ್ನು ನಿಗದಿಪಡಿಸಿ!",
    taskReminders: "ಶನಿವಾರದ ಕಾರ್ಯ ಜ್ಞಾಪನೆಗಳು",
    allTasksSettled: "ಎಲ್ಲಾ ಕಾರ್ಯಗಳು ಮುಗಿದಿವೆ! ಮುಂಬರುವ ಪೂಜೆಗೆ ಯಾವುದೇ ಬಾಕಿ ಕಾರ್ಯಗಳಿಲ್ಲ.",

    housesTitle: "ಮಂದಿರ ಮನೆಗಳ ನೋಂದಣಿ ಪುಸ್ತಕ",
    housesSubtitle: "ಗ್ರಾಮದ ಮನೆಗಳನ್ನು ಸೇರಿಸಿ, ತಿದ್ದುಪಡಿ ಮಾಡಿ ಮತ್ತು ಅವರ ದೂರವಾಣಿ ಮತ್ತು ಕುಟುಂಬದ ಮುಖ್ಯಸ್ಥರ ವಿವರಗಳನ್ನು ನಿರ್ವಹಿಸಿ.",
    addHouse: "ಹೊಸ ಮನೆಯನ್ನು ನೋಂದಾಯಿಸಿ",
    editHouse: "ಮನೆಯ ವಿವರಗಳನ್ನು ತಿದ್ದುಪಡಿ ಮಾಡಿ",
    houseId: "ಮನೆ ಐಡಿ (ID)",
    familyHead: "ಕುಟುಂಬದ ಮುಖ್ಯಸ್ಥರ ಹೆಸರು",
    houseName: "ಮನೆ / ಕುಟುಂಬದ ಹೆಸರು",
    phone: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    address: "ವಿಳಾಸ",
    isActive: "ಸಕ್ರಿಯ ಪ್ರಾಯೋಜಕತ್ವದ ಸ್ಥಿತಿ",
    searchHousesPlaceholder: "ಮುಖ್ಯಸ್ಥರ ಹೆಸರು, ಮನೆಯ ಹೆಸರು ಅಥವಾ ಐಡಿ ಮೂಲಕ ಹುಡುಕಿ...",
    noHousesFound: "ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಸಿಕ್ಕಿಲ್ಲ.",

    weeklyTitle: "ವಾರದ ಶನಿವಾರ ಪೂಜೆ",
    weeklySubtitle: "ಮುಂಬರುವ ಶನಿವಾರದ ಪೂಜೆಗಳನ್ನು ನಿಗದಿಪಡಿಸಿ, ಸೇವಾಕರ್ತರನ್ನು ನಿಯೋಜಿಸಿ ಮತ್ತು ವೆಚ್ಚಗಳನ್ನು ಯೋಜಿಸಿ.",
    createEvent: "ಪೂಜಾ ಕಾರ್ಯಕ್ರಮ ನಿಗದಿಪಡಿಸಿ",
    selectDate: "ಪೂಜಾ ದಿನಾಂಕವನ್ನು ಆರಿಸಿ",
    selectSponsors: "ಪೂಜಾ ಸೇವಾಕರ್ತರನ್ನು ಆರಿಸಿ",
    contributionPerSponsor: "ಪ್ರತಿ ಸೇವಾಕರ್ತರ ದೇಣಿಗೆ ಮೊತ್ತ",
    extraDonations: "ಹೆಚ್ಚುವರಿ ದೇಣಿಗೆ / ಕಾಣಿಕೆ",
    otherIncome: "ಇತರ ಆದಾಯಗಳು (ತುಪ್ಪ, ಎಣ್ಣೆ, ಸಾಮಾನ್ಯ)",
    priestExpenses: "ಅರ್ಚಕರ ಪೂಜಾ ದಕ್ಷಿಣೆ",
    shopExpenses: "ಅಂಗಡಿ ಸಾಮಗ್ರಿಗಳು (ಎಣ್ಣೆ, ಕರ್ಪೂರ, ತೆಂಗಿನಕಾಯಿ)",
    otherExpenses: "ಇತರ ವೆಚ್ಚಗಳು",
    recordBilling: "ಪೂಜಾ ದಿನದ ಬಿಲ್ಲಿಂಗ್ ದಾಖಲಿಸಿ",

    billingTitle: "ಪೂಜಾ ದಿನದ ಬಿಲ್ಲಿಂಗ್",
    billingSubtitle: "ಖಚಿತಪಡಿಸಿದ ಆಮಂತ್ರಣಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸೇವಾಕರ್ತರಾಗಿ ಸೇರಿಸಿ, ಅವರ ದೇಣಿಗೆ ತಿದ್ದಿ, ನಾಣ್ಯ ಕಾಣಿಕೆ ತಟ್ಟೆಯ ಹಣ ಮತ್ತು ಒಟ್ಟು ಉಳಿಕೆಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
    sponsorContributions: "ಸೇವಾಕರ್ತರ ಒಟ್ಟು ದೇಣಿಗೆ",
    otherCollections: "ಇತರ ಕಾಣಿಕೆ ಸಂಗ್ರಹಣೆ",
    coinKanike: "ನಾಣ್ಯ ಕಾಣಿಕೆ ತಟ್ಟೆಯ ನಗದು",
    totalRevenue: "ಒಟ್ಟು ಸಂಗ್ರಹವಾದ ಆದಾಯ",
    netMargin: "ನಿವ್ವಳ ಉಳಿದಿರುವ ಬ್ಯಾಲೆನ್ಸ್",
    noSponsorsRegistered: "ಯಾವುದೇ ಪ್ರಾಯೋಜಕರು ನೋಂದಾಯಿಸಲ್ಪಟ್ಟಿಲ್ಲ. ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",

    invitationsTitle: "ಸೇವಾಕರ್ತರ ಆಮಂತ್ರಣಗಳು",
    invitationsSubtitle: "ವಾರದ ಶನಿವಾರ ಪೂಜೆಯ ಆಮಂತ್ರಣ ಪತ್ರಗಳನ್ನು ತಯಾರಿಸಿ, ಮನೆಗಳನ್ನು ನಿಯೋಜಿಸಿ ಮತ್ತು ಮುಂಬರುವ ಶನಿವಾರಕ್ಕೆ ಖಚಿತಪಡಿಸಿದವರನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
    sendInvitation: "ಆಮಂತ್ರಣ ವಿನಂತಿಯನ್ನು ತಯಾರಿಸಿ",
    statusPending: "ಬಾಕಿ ಇದೆ (Pending)",
    statusInvited: "ಆಹ್ವಾನಿಸಲಾಗಿದೆ (Invited)",
    statusConfirmed: "ಖಚಿತಪಡಿಸಲಾಗಿದೆ (Confirmed)",
    statusCancelled: "ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ (Cancelled)",
    changeStatus: "ಸ್ಥಿತಿಯನ್ನು ಬದಲಾಯಿಸಿ",
    inviteSponsor: "ಸೇವಾಕರ್ತರನ್ನು ಆಹ್ವಾನಿಸಿ",

    historyTitle: "ಶನಿವಾರಗಳ ಪೂಜಾ ಇತಿಹಾಸ",
    historySubtitle: "ಕಳೆದ ವಾರಗಳ ಶನಿವಾರದ ಪೂಜೆಗಳು, ಆದಾಯ ಸಂಗ್ರಹಣೆ ಮತ್ತು ತಗುಲಿದ ವೆಚ್ಚಗಳ ಸಂಪೂರ್ಣ ಕಾಲಾನುಕ್ರಮ ಪುಸ್ತಕ.",
    historyDescription: "ಕಳೆದ ಶನಿವಾರದ ಪೂಜೆಗಳ ಒಟ್ಟು ದಾಖಲೆ",

    printTitle: "ಹಣಕಾಸು ಹೇಳಿಕೆಗಳು / ಆಡಿಟ್",
    printSubtitle: "ವಾರದ ಶನಿವಾರದ ಸಂಗ್ರಹಗಳು ಮತ್ತು ವೆಚ್ಚಗಳ ಅಧಿಕೃತ ಲೆಡ್ಜರ್ ಹೇಳಿಕೆಗಳನ್ನು ಮುದ್ರಿಸಿ ಮತ್ತು ವೀಕ್ಷಿಸಿ.",
    printDescription: "ಸಂಗ್ರಹಣೆಗಳು ಮತ್ತು ವೆಚ್ಚಗಳ ಅಧಿಕೃತ ಲೆಡ್ಜರ್ ವರದಿ",
    generateReport: "ವರದಿ ತಯಾರಿಸಿ",
    downloadPDF: "ಲೆಡ್ಜರ್ ವರದಿಯನ್ನು ಮುದ್ರಿಸಿ",
    printView: "ಪ್ರಿಂಟ್ / ಪಿಡಿಎಫ್ ವೀಕ್ಷಣೆ",

    settingsTitle: "ವ್ಯವಸ್ಥೆಯ ಸೆಟ್ಟಿಂಗ್ಸ್",
    settingsSubtitle: "ಡೀಫಾಲ್ಟ್ ದೇಣಿಗೆ ದರಗಳು, ಕರೆನ್ಸಿ ಚಿಹ್ನೆಗಳು ಮತ್ತು ಗ್ರಾಮದ ಗುರುತಿನ ವಿವರಗಳನ್ನು ಮಾರ್ಪಡಿಸಿ.",
    configureConstants: "ಜಾಗತಿಕ ನಿಯತಾಂಕಗಳನ್ನು ಕಾನ್ಫಿಗರ್ ಮಾಡಿ",
    defaultContributionRate: "ಡೀಫಾಲ್ಟ್ ಪ್ರಾಯೋಜಕತ್ವ ದೇಣಿಗೆ ದರ",
    currencySymbol: "ಕರೆನ್ಸಿ ಚಿಹ್ನೆ (ಉದಾ: ₹)",
    dbOperations: "ಡೇಟಾಬೇಸ್ ಕಾರ್ಯಾಚರಣೆಗಳು",
    unauthorizedEmail: "ಈ ಇಮೇಲ್ ವಿಳಾಸಕ್ಕೆ ಲಾಗಿನ್ ಮಾಡಲು ಅನುಮತಿ ಇಲ್ಲ.",
    manageAllowedEmails: "ಅನುಮತಿಸಲಾದ ಅಡ್ಮಿನ್ ಇಮೇಲ್‌ಗಳು",
    addAllowedEmail: "ಇಮೇಲ್ ಸೇರಿಸಿ",
    emailPlaceholder: "ಜಿಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ (ಉದಾ: example@gmail.com)",
    allowedEmailsSubtitle: "ಯಾರು ಲಾಗಿನ್ ಆಗಿ ಭಜನಾ ವ್ಯವಸ್ಥೆಯನ್ನು ಬದಲಾಯಿಸಬಹುದು ಅಥವಾ ಎಡಿಟ್ ಮಾಡಬಹುದು ಎಂಬುದನ್ನು ನಿರ್ದಿಷ್ಟಪಡಿಸಿ.",
    onlyAdminsCanManageAllowedEmails: "ಎಡಿಟ್ ಮಾಡಲು ಅನುಮತಿ ಹೊಂದಿರುವ ಅಧಿಕೃತ ಗೂಗಲ್ ಖಾತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ.",
  }
};

// Seeded/Sample Houses Kannada translations
export const KANNADA_HOUSE_TRANSLATIONS: Record<string, { familyHeadName: string; houseName: string; address?: string; notes?: string }> = {
  'H-01': {
    familyHeadName: 'ಮಂಜುನಾಥ ಹೆಗಡೆ',
    houseName: 'ಮನೆ-೧',
    address: 'ಪೂಜಾ ಸರ್ಕಲ್, ಕೈರಂಗಳ',
    notes: 'ಸಕ್ರಿಯ ಭಜನಾ ಗಾಯಕರು'
  },
  'H-02': {
    familyHeadName: 'ಗಣೇಶ ಭಟ್',
    houseName: 'ಪ್ರತಿಭಾ ನಿಲಯ',
    address: 'ಶ್ರೀ ಗೋಪಾಲಕೃಷ್ಣ ದೇವಸ್ಥಾನದ ಹತ್ತಿರ',
    notes: 'ಅರ್ಚಕರಿಗೆ ಸದಾ ಆತಿಥ್ಯ ನೀಡುತ್ತಾರೆ'
  },
  'H-03': {
    familyHeadName: 'ಅನಂತ ರಾವ್',
    houseName: 'ಶ್ರೀನಿವಾಸ ಕೃಪಾ',
    address: 'ಮುಖ್ಯ ರಸ್ತೆ ಜಂಕ್ಷನ್',
    notes: 'ಹಾರ್ಮೋನಿಯಂ ವಾದಕರು'
  },
  'H-04': {
    familyHeadName: 'ಶಶಿಧರ ನಾಯಕ್',
    houseName: 'ಗಂಗಾ ನಿಲಯ',
    address: 'ನದಿ ತೀರದ ರಸ್ತೆ ೨',
    notes: 'ವಿಶಾಲವಾದ ಸಭಾ ಸ್ಥಳವನ್ನು ಹೊಂದಿದ್ದಾರೆ'
  },
  'H-05': {
    familyHeadName: 'ವೆಂಕಟೇಶ ಕಿಣಿ',
    houseName: 'ಕಿಣಿ ಮ್ಯಾನ್ಷನ್',
    address: 'ಬಜಾರ್ ರಸ್ತೆ',
    notes: 'ನಿಯಮಿತ ದಾನಿಗಳು'
  },
  'H-06': {
    familyHeadName: 'ಸುರೇಶ್ ಶೆಣೈ',
    houseName: 'ಗೋಕುಲ',
    address: 'ದೇವಸ್ಥಾನದ ಉತ್ತರ ದ್ವಾರ',
    notes: 'ಸೇವೆಗೆ ಸದಾ ಸ್ವಯಂಸೇವಕರು'
  },
  'H-07': {
    familyHeadName: 'ರಾಜೇಂದ್ರ ಪ್ರಸಾದ್',
    houseName: 'ಸರಸ್ವತಿ ನಿಲಯ',
    address: 'ಶಾಲಾ ರಸ್ತೆ',
    notes: 'ಕೀರ್ತನೆಗಳನ್ನು ಹಾಡುತ್ತಾರೆ'
  },
  'H-08': {
    familyHeadName: 'ಸುಬ್ರಾಯ ಭಟ್',
    houseName: 'ಗುರು ಕೃಪಾ',
    address: 'ಭಟ್ಟರ ಕಾಂಪೌಂಡ್',
    notes: 'ತಬಲಾ ವಾದಕರ ಸಹಕಾರ'
  },
  'H-09': {
    familyHeadName: 'ಮೋಹನ್ ದಾಸ್ ಪೈ',
    houseName: 'ದುರ್ಗಾ ಪ್ರಸಾದ್',
    address: 'ಅಂಚೆ ಕಚೇರಿ ರಸ್ತೆ',
    notes: 'ಹೂವಿನ ತಟ್ಟೆಗಳನ್ನು ಜೋಡಿಸುತ್ತಾರೆ'
  },
  'H-10': {
    familyHeadName: 'ಶಂಕರ ನಾರಾಯಣ',
    houseName: 'ಶಿವ ಪ್ರಸಾದ್',
    address: 'ಬೆಟ್ಟದ ಮೇಲಿನ ಮೂಲೆ',
    notes: 'ಕೆಲವೊಮ್ಮೆ ಧ್ವನಿವರ್ಧಕ ವ್ಯವಸ್ಥೆ ಒದಗಿಸುತ್ತಾರೆ'
  },
  'H-11': {
    familyHeadName: 'ನಾಗೇಶ್ ರಾವ್',
    houseName: 'ಅನುಗ್ರಹ',
    address: 'ಹಳೆಯ ಶಾಲೆಯ ಹತ್ತಿರ',
    notes: 'ಯುವ ಸ್ವಯಂಸೇವಕರ ಸಂಯೋಜಕರು'
  },
  'H-12': {
    familyHeadName: 'ರಾಘವೇಂದ್ರ ಆಚಾರ್ಯ',
    houseName: 'ಐಶ್ವರ್ಯ',
    address: 'ರಥಬೀದಿ, ಕೈರಂಗಳ',
    notes: 'ಸಾಂಪ್ರದಾಯಿಕ ಪ್ರಸಾದ ತಯಾರಕರು'
  }
};

// Seeded Expenses & income source translations
export const KANNADA_EXPENSE_NAME_TRANSLATIONS: Record<string, string> = {
  "Satyanarayana Pooja Priest": "ಸತ್ಯನಾರಾಯಣ ಪೂಜಾ ಅರ್ಚಕರು",
  "Weekly Pooja Priest Fee": "ವಾರದ ಪೂಜೆ ಅರ್ಚಕರ ಶುಲ್ಕ",
  "Weekly Priest Service": "ವಾರದ ಅರ್ಚಕರ ಸೇವೆ",
  "Priest Special Pooja Dakshina": "ಅರ್ಚಕರ ವಿಶೇಷ ಪೂಜೆ ದಕ್ಷಿಣೆ",
  "Roses & Jasmine Garland": "ಗುಲಾಬಿ ಮತ್ತು ಮಲ್ಲಿಗೆ ಹೂವಿನ ಹಾರ",
  "Grand Flower decoration": "ಭವ್ಯ ಹೂವಿನ ಅಲಂಕಾರ",
  "Temple Flowers": "ದೇವಸ್ಥಾನದ ಹೂವುಗಳು",
  "Altar Flowers & Garland": "ಗರ್ಭಗುಡಿ ಹೂವುಗಳು ಮತ್ತು ಹಾರ",
  "Coconuts": "ತೆಂಗಿನಕಾಯಿಗಳು",
  "Coconuts & Camphor": "ತೆಂಗಿನಕಾಯಿ ಮತ್ತು ಕರ್ಪೂರ",
  "Bananas & Mangos": "ಬಾಳೆಹಣ್ಣು ಮತ್ತು ಮಾವಿನಹಣ್ಣು",
  "Kesaribath Sweets": "ಕೇಸರಿಬಾತ್ ಪ್ರಸಾದ",
  "Samosa & Tea": "ಸಮೋಸಾ ಮತ್ತು ಚಹಾ",
  "Puliyogare & Payasam": "ಪುಳಿಯೋಗರೆ ಮತ್ತು ಪಾಯಸ",
  "Incense and Oil": "ದೂಪ ಮತ್ತು ಎಣ್ಣೆ",
  "Kairangala Sound System": "ಕೈರಂಗಳ ಧ್ವನಿವರ್ಧಕ ವ್ಯವಸ್ಥೆ",
  "Priest Sambhavana": "ಅರ್ಚಕ ಸಂಭಾವನೆ",
  "Deity flower garlands": "ದೇವರ ಹೂವಿನ ಹಾರಗಳು",
  "3 coconuts for kalash and prasad": "ಕಲಶ ಮತ್ತು ಪ್ರಸಾದಕ್ಕಾಗಿ ೩ ತೆಂಗಿನಕಾಯಿ",
  "Prasad sweets distribution": "ಪ್ರಸಾದ ಸಿಹಿ ವಿತರಣೆ",
  "Alankara Puja": "ಅಲಂಕಾರ ಪೂಜೆ",
  "Full altar marigold garlands": "ಪೂರ್ಣ ಗರ್ಭಗುಡಿ ಅಲಂಕಾರದ ಹೂಮಾಲೆಗಳು",
  "Pooja offering fruits": "ಪೂಜಾ ಅರ್ಪಣೆಯ ಹಣ್ಣುಗಳು",
  "Pooja essentials": "ಪೂಜಾ ಪರಿಕರಗಳು",
  "Temple store items": "ದೇವಸ್ಥಾನದ ಸಾಮಗ್ರಿಗಳು",
  "Arati and archana": "ಆರತಿ ಮತ್ತು ಅರ್ಚನೆ",
  "For bhajan singers and devotees": "ಭಜಕರು ಮತ್ತು ಭಕ್ತಾದಿಗಳಿಗೆ",
  "Monthly grand pooja": "ತಿಂಗಳ ಮಹಾಪೂಜೆ",
  "Decoration flowers": "ಅಲಂಕಾರಿಕ ಹೂವುಗಳು",
  "Amplifier & mic rent": "ಧ್ವನಿವರ್ಧಕ ಮತ್ತು ಮೈಕ್ರೊಫೋನ್ ಬಾಡಿಗೆ",
  "Mahaprasadam preparation groceries": "ಮಹಾಪ್ರಸಾದ ತಯಾರಿಕೆಯ ದಿನಸಿ ಸಾಮಗ್ರಿಗಳು"
};

export const KANNADA_CATEGORY_TRANSLATIONS: Record<string, string> = {
  'Priest (Pooja)': 'ಅರ್ಚಕರು (ಪೂಜೆ)',
  'Flowers': 'ಹೂವುಗಳು',
  'Coconut': 'ತೆಂಗಿನಕಾಯಿ',
  'Fruits': 'ಹಣ್ಣುಗಳು',
  'Shop Items': 'ಅಂಗಡಿ ಸಾಮಗ್ರಿಗಳು',
  'Snacks': 'ತಿಂಡಿ ತಿನಿಸುಗಳು',
  'Sound System': 'ಧ್ವನಿವರ್ಧಕ ವ್ಯವಸ್ಥೆ',
  'Decoration': 'ಅಲಂಕಾರ',
  'Other': 'ಇತರೆ'
};

export const KANNADA_INCOME_SOURCE_TRANSLATIONS: Record<string, string> = {
  'House Sponsor': 'ಮನೆ ಪ್ರಾಯೋಜಕತ್ವ (ಸೇವೆ)',
  'Donation': 'ಕಾಣಿಕೆ/ದೇಣಿಗೆ',
  'Other': 'ಇತರೆ'
};

// Generic Translation helper for a single House profile
export function translateHouse(house: any, language: Language): any {
  if (language === 'en' || !house) return house;
  const trans = KANNADA_HOUSE_TRANSLATIONS[house.houseId];
  if (trans) {
    return {
      ...house,
      familyHeadName: trans.familyHeadName || house.familyHeadName,
      houseName: trans.houseName || house.houseName,
      address: trans.address || house.address,
      notes: trans.notes || house.notes,
    };
  }
  return house;
}

// Generic Translation helper for Invitations
export function translateInvitation(invitation: any, language: Language): any {
  if (language === 'en' || !invitation) return invitation;
  const trans = KANNADA_HOUSE_TRANSLATIONS[invitation.houseId];
  if (trans) {
    return {
      ...invitation,
      familyHeadName: trans.familyHeadName || invitation.familyHeadName,
      houseName: trans.houseName || invitation.houseName,
    };
  }
  return invitation;
}

// Generic Translation helper for Billing Records
export function translateBillingRecord(record: any, language: Language): any {
  if (language === 'en' || !record) return record;
  const sponsors = record.sponsors?.map((sp: any) => {
    const trans = KANNADA_HOUSE_TRANSLATIONS[sp.houseId];
    if (trans) {
      return {
        ...sp,
        familyHeadName: trans.familyHeadName || sp.familyHeadName,
        houseName: trans.houseName || sp.houseName,
      };
    }
    return sp;
  });
  return {
    ...record,
    sponsors
  };
}

// Generic Translation helper for Income lists
export function translateIncome(income: any, language: Language): any {
  if (language === 'en' || !income) return income;
  let translatedHead = income.familyHeadName;
  // If it matches a family head name in our translation set
  for (const key of Object.keys(KANNADA_HOUSE_TRANSLATIONS)) {
    const orig = KANNADA_HOUSE_TRANSLATIONS[key];
    if (income.familyHeadName && (income.familyHeadName.includes(key) || income.familyHeadName === orig.familyHeadName || key === income.houseId)) {
      translatedHead = orig.familyHeadName;
      break;
    }
  }
  return {
    ...income,
    source: KANNADA_INCOME_SOURCE_TRANSLATIONS[income.source] || income.source,
    familyHeadName: translatedHead,
    description: income.description ? (income.description.replace('Sponsorship - ', 'ಪ್ರಾಯೋಜಕತ್ವ - ') || income.description) : income.description
  };
}

// Generic Translation helper for Expenses
export function translateExpense(expense: any, language: Language): any {
  if (language === 'en' || !expense) return expense;
  return {
    ...expense,
    expenseName: KANNADA_EXPENSE_NAME_TRANSLATIONS[expense.expenseName] || expense.expenseName,
    category: KANNADA_CATEGORY_TRANSLATIONS[expense.category] || expense.category,
    description: KANNADA_EXPENSE_NAME_TRANSLATIONS[expense.description] || expense.description || expense.description
  };
}
