export type Ride = {
    id: string;
    driverId: string;
    vehicleId: string;
    origin: string;
    destination: string;
    departureTime: string;
    fare: number;
    availableSeats: number;
    passengers: string[];
    details?: string;
    createdAt: string;
    updatedAt: string;
};
