import { Timestamp } from 'firebase/firestore';

export type Booking = {
    id: string;
    rideId: string;
    passengerId: string;
    bookingTime: Timestamp;
    numberOfSeats: number;
    status: 'pending' | 'confirmed' | 'declined' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'refunded';
    updatedAt?: Timestamp;
};
