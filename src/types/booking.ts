
export type Booking = {
    id: string;
    rideId: string;
    passengerId: string;
    bookingTime: string;
    numberOfSeats: number;
    status: 'confirmed' | 'cancelled';
    paymentStatus: 'paid' | 'refunded';
};

    