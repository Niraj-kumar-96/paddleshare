export type Ride = {
    id: string;
    driverId: string;
    origin: string;
    destination: string;
    departureTime: string;
    fare: number;
    availableSeats: number;
    details?: string;
    createdAt: string;
    updatedAt: string;
};
