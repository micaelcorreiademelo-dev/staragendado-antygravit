

export interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  period?: string;
}

export enum StoreStatus {
  ACTIVE = 'Ativa',
  BLOCKED = 'Bloqueada',
  PENDING = 'Pendente'
}

export interface Store {
  id: string;
  name: string;
  email: string;
  status: StoreStatus;
  plan: string;
  joinedDate: string;
  avatar?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'Erro' | 'Info' | 'Aviso';
  store: string;
  module: string;
  description: string;
}

export interface PlanFeatures {
  onlinePayments: boolean;
  calendarIntegration: boolean;
  apiAccess: boolean;
  whatsappNotifications?: boolean;
  emailNotifications?: boolean;
}

export interface Plan {
  id: string | number;
  name: string;
  price: string;
  description: string;
  professionalsLimit: number;
  appointmentsLimit: number;
  services: string[];
  features: PlanFeatures;
  displayFeatures?: string[];
  active: boolean;
  highlight: boolean;
  vigencia_dias?: number;
  hidden?: boolean;
  is_default?: boolean;
}

// --- Support, Notification & Chat Types ---

export interface SupportArticle {
  id: string;
  title: string;
  category: string;
  content: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  storeId: string; // Target store
}

export interface ChatMessage {
  id: string;
  storeId: string; // The conversation it belongs to
  sender: 'admin' | 'shop';
  text: string;
  timestamp: string;
  read: boolean;
}


// --- Shopkeeper & Professional Types ---

export interface Service {
  id: string;
  name: string;
  category: string;
  duration: number; // minutes
  price: number;
  description: string;
  professionalIds: string[]; // IDs of professionals who perform this service
  image?: string; // Optional image URL
}

export interface TimeInterval {
  start: string;
  end: string;
}

export interface DaySchedule {
  isWorking: boolean;
  intervals: TimeInterval[];
}

export type WeekSchedule = {
  [day in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: DaySchedule;
};

export interface Unavailability {
  id: string;
  start: string; // ISO String
  end: string;   // ISO String
  reason: string;
}

export interface Permissions {
  canViewDashboard: boolean;
  canManageCalendar: boolean;
  canManageServices: boolean;
  canManageClients: boolean;
  visualizar_apenas_seus_agendamentos?: boolean;
}

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: 'Active' | 'Inactive';
  workSchedule: WeekSchedule;
  password?: string; // For login
  permissions: Permissions;
  unavailability: Unavailability[];
}

export interface Appointment {
  id: string;
  clientName: string;
  serviceName: string;
  professionalName: string;
  date: string; // Single ISO string for date and time
  duration: number; // Duration in minutes
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
}