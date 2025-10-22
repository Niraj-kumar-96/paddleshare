
export type Booking = {
    id: string;
    rideId: string;
    passengerId: string;
    bookingTime: string;
    numberOfSeats: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'declined';
    paymentStatus: 'pending' | 'paid' | 'refunded';
};
