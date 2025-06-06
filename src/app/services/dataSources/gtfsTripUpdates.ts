"use server";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import { get } from "@shared/services/serviceBase";
import type { ITripUpdate } from "@shared/models/ITripUpdate";
import { MetricsTracker } from "@/app/utilities/MetricsTracker";

export const getTripUpdates = async (): Promise<ITripUpdate[]> => {
	try {
		const url = `https://opendata.samtrafiken.se/gtfs-rt/sl/TripUpdates.pb?key=${process.env.GTFS_REGIONAL_REALTIME}`;
		const response = await get<ArrayBuffer>(url, "arraybuffer");
		MetricsTracker.trackApiCall();

		const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
			new Uint8Array(response),
		);
		const tripUpdates = feed.entity
			.map((entity) => {
				if (entity.tripUpdate) {
					return entity.tripUpdate;
				}
				return null;
			})
			.filter(Boolean) as ITripUpdate[];
		const data = JSON.parse(JSON.stringify(tripUpdates));
		return data;
	} catch (error) {
		console.log(error);
		return [];
	}
};
