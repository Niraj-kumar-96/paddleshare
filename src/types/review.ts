
import { Timestamp } from "firebase/firestore";

export type Review = {
    id: string;
    rideId: string;
    driverId: string;
    reviewerId: string;
    rating: number;
    comment: string;
    createdAt: Timestamp;
};
