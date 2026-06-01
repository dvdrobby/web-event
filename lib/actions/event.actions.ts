'use server';

import dbConnect from "@/lib/mongodb";
import Event from "@/database/event.model";

export const getAllEvents = async () => {
    try {
        await dbConnect();
        const events = await Event.find().sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(events));
    } catch (e) {
        return [];
    }
}

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await dbConnect();
        const event = await Event.findOne({ slug });
        return JSON.parse(JSON.stringify(await Event.find({ _id: { $ne: event?._id }, tags: { $in: event?.tags } }).lean()));
    } catch (e) {
        return [];
    }
}
