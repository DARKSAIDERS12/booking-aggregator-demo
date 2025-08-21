// Основные типы для системы

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Station {
  id: string;
  name: string;
  code?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface StationMapping {
  id: string;
  api1StationId: string;
  api2StationId: string;
  groupId?: string;
  isMain: boolean;
  api1Station: Station;
  api2Station: Station;
}

export interface StationGroup {
  id: string;
  name: string;
  mainStationId?: string;
  mappings: StationMapping[];
}

export interface SearchRouteRequest {
  from: string;
  to: string;
  date: string;
  passengers?: number;
}

export interface Route {
  id: string;
  from: Station;
  to: Station;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  availableSeats: number;
  carrier: string;
  vehicleType: string;
  source?: 'GDS API 1' | 'RF Bus API 2'; // Источник API
}

export interface BookingRequest {
  routeId: string;
  passengers: Passenger[];
  seats: string[];
}

export interface Passenger {
  firstName: string;
  lastName: string;
  middleName?: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
}

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  paymentMethod: string;
}

export interface CancelRequest {
  ticketIds: string[];
  reason?: string;
}

// Интерфейсы для GDS API 1.14
export interface GdsPoint {
  id: number;
  name: string;
  address: string;
  region: string;
  latitude?: number;
  longitude?: number;
}

export interface GdsRace {
  uid: string;
  name: string;
  num: string;
  dispatchDate: Date;
  arrivalDate: Date;
  dispatchPointId: number;
  arrivalPointId: number;
  dispatchStationName: string;
  arrivalStationName: string;
  price: number;
  freeSeatCount: number;
  freeSeatEstimation: string;
  carrier: string;
  busInfo: string;
  status: string;
  type: string;
  depotId: number;
}

export interface TicketPayment {
  type: 'FARE' | 'SUPPLIER_FEE' | 'AGENT_FEE' | 'DEDUCTION';
  name: string;
  amount: number;
  taxRate: number | null; // 5, 7, 10, 12, null (без НДС), -1 (неизвестно)
  relation: 'AGENT' | 'OWN';
  supplierInfo?: string;
  supplierInn?: string;
}

export interface GdsTicket {
  id: number;
  uid: string;
  ticketCode: string;
  ticketNum: string;
  ticketSeries: string;
  ticketClass: string;
  ticketType: string;
  raceUid: string;
  raceNum: string;
  raceName: string;
  dispatchDate: Date;
  arrivalDate: Date;
  dispatchStation: string;
  arrivalStation: string;
  seat: string;
  platform: string;
  lastName: string;
  firstName: string;
  middleName: string;
  docType: string;
  docSeries: string;
  docNum: string;
  citizenship: string;
  gender: string;
  birthday: Date;
  price: number;
  supplierPrice: number;
  dues: number;
  vat: number;
  status: string;
  payments?: TicketPayment[];
}

export interface GdsOrder {
  uid: string;
  id: number;
  reserveCode: string;
  total: number;
  status: string;
  created: Date;
  expired: Date;
  finished?: Date;
  tickets: GdsTicket[];
}

// Интерфейсы для сопоставления станций
export interface StationMapping {
  id: string;
  api1StationId: string;
  api2StationId: string;
  confidence: number; // Уровень уверенности в сопоставлении (0-1)
  isManual: boolean; // Ручное сопоставление
  isMain: boolean; // Главная станция в группе
  createdAt: Date;
  updatedAt: Date;
}

export interface StationGroup {
  id: string;
  name: string;
  mainStation: Station; // Главная станция группы
  stations: Station[]; // Все станции в группе
  createdAt: Date;
  updatedAt: Date;
}

// Интерфейсы для кэширования
export interface ApiCache {
  id: string;
  key: string;
  data: any;
  expiresAt: Date;
  createdAt: Date;
}

// Интерфейсы для статуса API
export interface ApiStatus {
  api1: boolean;
  api2: boolean;
  summary: string;
}

export interface ApiStats {
  api1: {
    status: boolean;
    lastCheck: Date;
    responseTime: number;
    error?: string;
  };
  api2: {
    status: boolean;
    lastCheck: Date;
    responseTime: number;
    error?: string;
  };
}
