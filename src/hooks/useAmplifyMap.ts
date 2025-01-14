/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { useAmplifyMapService } from "@demo/services";
import { useAmplifyMapStore } from "@demo/stores";
import { CurrentLocationDataType, EsriMapEnum, HereMapEnum, MapProviderEnum } from "@demo/types";

import { errorHandler } from "@demo/utils/errorHandler";

const useAmplifyMap = () => {
	const store = useAmplifyMapStore();
	const { setInitial } = store;
	const { setState } = useAmplifyMapStore;
	const mapsService = useAmplifyMapService();

	const methods = useMemo(
		() => ({
			getDefaultMap: () => {
				try {
					return mapsService.getDefaultMap();
				} catch (error) {
					errorHandler(error, "Failed to fetch default map");
				}
			},
			getAvailableMaps: () => {
				try {
					return mapsService.getAvailableMaps();
				} catch (error) {
					errorHandler(error, "Failed to fetch available maps");
				}
			},
			setCurrentLocation: (currentLocationData: CurrentLocationDataType) => {
				setState({ currentLocationData });
			},
			setMapProvider: (mapProvider: MapProviderEnum) => {
				setState({ mapProvider });
			},
			setMapStyle: (mapStyle: EsriMapEnum | HereMapEnum) => {
				setState({ mapStyle });
			},
			setAttributionText: (attributionText: string) => {
				setState({ attributionText });
			},
			resetStore() {
				setState({
					currentLocationData: undefined
				});
				setInitial();
			}
		}),
		[mapsService, setState, setInitial]
	);

	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default useAmplifyMap;
