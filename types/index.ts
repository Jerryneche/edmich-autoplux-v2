// app/types/index.ts
// Central type exports — import from '@/types'

// ============================================
// PRODUCTS & MARKETPLACE
// ============================================
export * from "./product";

// ============================================
// BOOKINGS (Mechanic + Logistics)
// ============================================
export * from "./booking";

// ============================================
// USER & AUTH
// ============================================
export {
  UserRole,
  OnboardingStatus,
  BookingStatus,
  LogisticsStatus,
  TradeInStatus,
  NotificationType,
} from "@prisma/client";

// Optional: Custom user type if you extend Prisma.User
// export type { User } from './user';

// ============================================
// CART & ORDERS
// ============================================
export type { CartItem, AddToCartPayload } from "./product"; // already in product.ts

// Later: export * from './order';
// export * from './cart';

// ============================================
// NOTIFICATIONS
// ============================================
// export * from './notification';

// ============================================
// UTILS & HELPERS
// ============================================
// export * from './utils';

// ============================================
// PRISMA RAW TYPES (Optional – for advanced use)
// ============================================
// Uncomment if you need direct Prisma types
/*
import type {
  Product,
  LogisticsBooking,
  MechanicBooking,
  User,
  SupplierProfile,
  LogisticsProfile,
  MechanicProfile,
} from '@prisma/client';

export type {
  Product as PrismaProduct,
  LogisticsBooking,
  MechanicBooking,
  User as PrismaUser,
  SupplierProfile,
  LogisticsProfile,
  MechanicProfile,
};
*/
