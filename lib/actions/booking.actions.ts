'use server';

import Booking from '@/database/booking.model';
import dbConnect from '../mongodb';

export const createBooking = async ({ eventId, email }: { eventId: string, email: string }) => {
    try {
        await dbConnect;
        await Booking.create({ eventId, email });

        return { success: true };

    } catch (e) {
        return { success: false, error: e }
    }
}