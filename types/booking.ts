// app/types/booking.ts
import type { BookingStatus } from "@prisma/client";

export type BookingType = "MECHANIC" | "LOGISTICS";

interface BaseBooking {
  id: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface MechanicBookingDetails extends BaseBooking {
  type: "MECHANIC";
  mechanic: {
    businessName: string;
    phone: string;
    city: string;
    state: string;
  } | null;
  driver?: never;
}

export interface LogisticsBookingDetails extends BaseBooking {
  type: "LOGISTICS";
  driver: {
    companyName: string;
    phone: string;
    city: string;
    state: string;
  } | null;
  mechanic?: never;
}

export type BookingDetails = MechanicBookingDetails | LogisticsBookingDetails;

// Type guards
export const isMechanicBooking = (
  booking: BookingDetails
): booking is MechanicBookingDetails => booking.type === "MECHANIC";

export const isLogisticsBooking = (
  booking: BookingDetails
): booking is LogisticsBookingDetails => booking.type === "LOGISTICS";
