import { use, useEffect, useState } from "react";
import type { IDbData } from "../models/IDbData";
import { getDistanceFromLatLon } from "../utilities/getDistanceFromLatLon";
import { getClosest } from "../utilities/getClosest";
import { useDataContext } from "../context/DataContext";
import { set } from "zod";

interface IUser {
	lat: number;
	lng: number;
	closestStop: IDbData | null;
	tripsAtClosestStop: IDbData[];
}

const useUserPosition = () => {
	const [userPosition, setUserPosition] = useState<IUser | null>(null);
	const { cachedDbDataState } = useDataContext();
	useEffect(() => {
		if (!navigator.geolocation) {
			console.error("Geolocation is not supported by this browser.");
			return;
		}

		const updateUserPosition = (pos: GeolocationPosition) => {
			const { latitude, longitude } = pos.coords;

			const newClosestStop =
				cachedDbDataState.length > 0
					? (getClosest(cachedDbDataState, latitude, longitude) as IDbData)
					: null;

			setUserPosition((prev) => {
				if (!prev || prev.lat !== latitude || prev.lng !== longitude) {
					return {
						lat: latitude,
						lng: longitude,
						closestStop: newClosestStop,
						tripsAtClosestStop: cachedDbDataState.filter(
							(stop) => stop.stop_id === newClosestStop?.stop_id,
						),
					};
				}
				return prev;
			});
		};

		const errorHandler = (error: GeolocationPositionError) => {
			console.error("Error getting location:", error.message);
		};

		const watchId = navigator.geolocation.watchPosition(
			updateUserPosition,
			errorHandler,
			{
				enableHighAccuracy: true,
				maximumAge: 0,
			},
		);

		return () => navigator.geolocation.clearWatch(watchId);
	}, [cachedDbDataState]);

	return { userPosition, setUserPosition };
};

export default useUserPosition;
