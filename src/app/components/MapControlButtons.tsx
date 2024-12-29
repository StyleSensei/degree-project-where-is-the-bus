import { useEffect, type MutableRefObject } from "react";
import { Button } from "./Button";
import { table, zoomInIcon, zoomOutIcon, follow } from "../../../public/icons";
import type { IVehiclePosition } from "../services/dataSources/gtfsRealtime";
import colors from "../colors.module.scss";

interface MapControlButtonsProps {
	googleMapRef: MutableRefObject<google.maps.Map | null>;
	zoomIn: (GoogleMap: google.maps.Map) => void;
	zoomOut: (GoogleMap: google.maps.Map) => void;
	setShowCurrentTrips: (showCurrentTrips: boolean) => void;
	showCurrentTrips: boolean;
	filteredVehicles: IVehiclePosition[];
	setFollowBus: (followBus: boolean) => void;
	followBus: boolean;
	activeMarker: boolean;
}

export const MapControlButtons = ({
	googleMapRef,
	zoomIn,
	zoomOut,
	setShowCurrentTrips,
	showCurrentTrips,
	filteredVehicles,
	setFollowBus,
	followBus,
	activeMarker,
}: MapControlButtonsProps) => {
	useEffect(() => {
		const inputContainer = document.getElementById("searchbar");
		inputContainer?.addEventListener("focus", () => {
			setFollowBus(false);
		});
		return () => {
			inputContainer?.removeEventListener("focus", () => {
				setFollowBus(false);
			});
		};
	}, [setFollowBus]);

	return (
		<div className="map-control-buttons">
			<div className="map-control-button-container">
				<div className="zoom-buttons">
					<p className="label zoom-label">Zoom</p>

					<Button
						className="--zoom"
						aria-label="Zooma in"
						title="Zooma in"
						path={zoomInIcon.pathD}
						pathFillRule1={zoomInIcon.pathFillRuleD1}
						pathFillRule2={zoomInIcon.pathFillRuleD2}
						fill="whitesmoke"
						onClick={() =>
							googleMapRef.current ? zoomIn(googleMapRef.current) : null
						}
					/>
				</div>
				<div className="map-control-button-container">
					<Button
						className="--zoom"
						aria-label="Zooma ut"
						title="Zooma ut"
						path={zoomOutIcon.pathD}
						pathFillRule1={zoomOutIcon.pathFillRuleD1}
						pathFillRule2={zoomOutIcon.pathFillRuleD2}
						fill="whitesmoke"
						onClick={() =>
							googleMapRef.current ? zoomOut(googleMapRef.current) : null
						}
					/>
				</div>
			</div>

			{filteredVehicles.length > 0 && (
				<div className="map-control-button-container">
					<p className="label table-label">Tabell</p>
					<Button
						title="Visa pågående resor"
						path={table.path}
						fill={
							showCurrentTrips ? colors.primaryColor : colors.secondaryColor
						}
						className={showCurrentTrips ? "--table --active" : "--table"}
						onClick={() => setShowCurrentTrips(!showCurrentTrips)}
					/>
				</div>
			)}
			{filteredVehicles.length > 0 && activeMarker && (
				<div className="map-control-button-container">
					<p className="label follow-label">Följ buss</p>
					<Button
						title="Följ buss"
						pathFillRule1={follow.path}
						fill={followBus ? colors.primaryColor : colors.secondaryColor}
						className={followBus ? "--follow --active" : "--follow"}
						onClick={() => {
							setFollowBus(!followBus);
						}}
					/>
				</div>
			)}
		</div>
	);
};
