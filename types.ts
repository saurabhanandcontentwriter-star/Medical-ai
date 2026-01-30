
export enum Sender {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isThinking?: boolean;
}

export interface HealthMetric {
  date: string;
  value: number;
  unit: string;
}

export interface VitalSign {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export interface Language {
  code: string;
  name: string;
  native: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'English', name: 'English', native: 'English' },
  { code: 'Hindi', name: 'Hindi', native: 'हिंदी' },
  { code: 'Bengali', name: 'Bengali', native: 'বাংলা' },
  { code: 'Telugu', name: 'Telugu', native: 'తెలుగు' },
  { code: 'Marathi', name: 'Marathi', native: 'मराठी' },
  { code: 'Tamil', name: 'Tamil', native: 'தமிழ்' },
  { code: 'Gujarati', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'Kannada', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'Malayalam', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'Punjabi', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  ANALYZER = 'ANALYZER',
  DOCTOR_FINDER = 'DOCTOR_FINDER',
  ORDER_MEDICINE = 'ORDER_MEDICINE',
  BOOK_TEST = 'BOOK_TEST',
  HEALTH_NEWS = 'HEALTH_NEWS',
  HEALTH_TIPS = 'HEALTH_TIPS',
  YOGA = 'YOGA',
  TRACKING = 'TRACKING',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN',
  MED_REMINDERS = 'MED_REMINDERS',
  VIDEO_CONSULT = 'VIDEO_CONSULT',
  BLOG = 'BLOG',
  AMBULANCE = 'AMBULANCE',
  MEDICAL_COLLEGES = 'MEDICAL_COLLEGES'
}

export interface MedicationReminder {
  id: string;
  name: string;
  dosage: string;
  time: string;
  type: 'pill' | 'syrup' | 'injection' | 'topical';
  isTakenToday: boolean;
  lastTakenDate?: string;
}

export interface DoctorSearchResult {
  text: string;
  places: Array<{
    title: string;
    uri: string;
    location?: {
      lat: number;
      lng: number;
    };
  }>;
}

export interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

export interface LabTest {
  id: string;
  name: string;
  description: string;
  price: number;
  preparation: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'order' | 'info' | 'alert';
}

export interface OrderStatusStep {
  label: string;
  timestamp?: string;
  isCompleted: boolean;
}

export interface DeliveryAgent {
  name: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  type: 'medicine' | 'lab_test' | 'doctor_appointment' | 'ambulance';
  title: string;
  details: string; // comma separated items
  amount: number;
  date: Date;
  status: string;
  steps: OrderStatusStep[];
  deliveryAgent?: DeliveryAgent;
  invoiceUrl?: string;
  reportUrl?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  totalTimeSpent?: number; // In seconds
}

export interface HealthNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string;
  category: string;
}

export interface HealthTip {
  id: string;
  title: string;
  description: string;
  category: 'Nutrition' | 'Lifestyle' | 'Mental Health' | 'Exercise';
  icon: string;
}

export interface YogaSession {
  id: string;
  title: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  focus: string;
  poses: string[];
}

export interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  readTime: string;
  category: string;
  image: string;
  date: string;
}

export interface MedicalCollege {
  id: string;
  name: string;
  city: string;
  established: string;
  type: 'Government' | 'Private';
  seats: number;
  rating: string;
  image: string;
  location: { lat: number; lng: number };
  description: string;
  website: string;
}