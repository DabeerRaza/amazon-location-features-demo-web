/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { useAwsPlaceService } from "@demo/services";
import { useAmplifyMapStore, useAwsPlaceStore } from "@demo/stores";
import { ClustersType, SuggestionType, ViewPointType } from "@demo/types";

import { errorHandler } from "@demo/utils/errorHandler";
import { calculateClusters, getHash, getPrecision, isGeoString } from "@demo/utils/geoCalculation";
import { Position } from "aws-sdk/clients/location";

const useAwsPlace = () => {
	const store = useAwsPlaceStore();
	const { setInitial } = store;
	const { setState } = useAwsPlaceStore;
	const { mapProvider } = useAmplifyMapStore();
	const placesService = useAwsPlaceService(mapProvider, store.viewpoint);

	const methods = useMemo(
		() => ({
			searchPlaceSuggestions: async (value: string, viewpoint: ViewPointType, cb?: (sg: SuggestionType[]) => void) => {
				try {
					setState({ isSearching: true });
					const data = await placesService.getPlaceSuggestions(value);
					cb
						? cb(data?.Results.map(({ PlaceId, Text }) => ({ PlaceId, Text })) as SuggestionType[])
						: setState({
								suggestions: data?.Results.map(({ PlaceId, Text }) => ({ PlaceId, Text }))
						  });
					setState({
						viewpoint,
						bound: undefined
					});
				} catch (error) {
					errorHandler(error, "Failed to search place suggestions");
				} finally {
					setState({ isSearching: false });
				}
			},
			getPlaceData: async (placeId: string) => {
				try {
					setState({ isFetchingPlaceData: true });
					const data = await placesService.getPlaceById(placeId);
					return data;
				} catch (error) {
					errorHandler(error, "Failed to fetch place by ID");
				} finally {
					setState({ isFetchingPlaceData: false });
				}
			},
			searchPlacesByText: async (value: string, viewpoint: ViewPointType, cb?: (sg: SuggestionType[]) => void) => {
				try {
					setState({ isSearching: true });
					const data = await placesService.getPlacesByText(value);
					const clusters: ClustersType = {};
					const suggestions = data?.Results?.map(p => {
						const Hash = getHash(p.Place.Geometry.Point as Position, store.precision);
						const sg = {
							...p,
							Hash
						} as SuggestionType;
						clusters[Hash] = clusters[Hash] ? [...clusters[Hash], sg] : [sg];
						return sg;
					});
					cb ? cb(suggestions as SuggestionType[]) : setState({ suggestions });
					setState({
						bound: data?.Summary.ResultBBox,
						viewpoint,
						clusters
					});
				} catch (error) {
					errorHandler(error, "Failed to search place by text");
				} finally {
					setState({ isSearching: false });
				}
			},
			getPlaceDataByCoordinates: async (input: Position) => {
				try {
					return await placesService.getPlaceByCoordinates(input);
				} catch (error) {
					errorHandler(error, "Failed to fetch place by coordinates");
				}
			},
			searchPlacesByCoordinates: async (
				value: string,
				viewpoint: ViewPointType,
				cb?: (sg: SuggestionType[]) => void
			) => {
				try {
					setState({ isSearching: true });
					const [lat, lng] = value.split(",");
					const data = await placesService.getPlaceByCoordinates([parseFloat(lng), parseFloat(lat)]);
					const vPoint = data
						? { longitude: data.Summary.Position[0] || 0, latitude: data.Summary.Position[1] || 0 }
						: viewpoint;
					const Hash = getHash([vPoint.longitude, vPoint.latitude], 10);
					const suggestion = { ...data?.Results[0], Hash };
					cb ? cb([suggestion]) : setState({ suggestions: [suggestion] });
					setState({ viewpoint: vPoint, bound: undefined });
				} catch (error) {
					errorHandler(error, "Failed to search place by coordinates");
				} finally {
					setState({ isSearching: false });
				}
			},
			search: async (value: string, viewpoint: ViewPointType, exact?: boolean, cb?: (sg: SuggestionType[]) => void) => {
				if (isGeoString(value)) {
					await methods.searchPlacesByCoordinates(value, viewpoint, cb);
				} else if (exact) {
					await methods.searchPlacesByText(value, viewpoint, cb);
				} else if (value?.length) {
					await methods.searchPlaceSuggestions(value, viewpoint, cb);
				}
			},
			setZoom: (zoom: number) => {
				setState(s => {
					const v = Math.round(s.clusterZoom - zoom);
					if (s.clusters && s.suggestions && s.suggestions.length > 1 && Math.abs(v) >= 1) {
						const precision = getPrecision(zoom, s.precision);
						const clusters = calculateClusters(s.suggestions, precision);
						return { zoom, clusterZoom: Math.round(zoom), precision, clusters };
					}
					return { zoom };
				});
			},
			setViewpoint: (viewpoint: ViewPointType) => {
				setState({ viewpoint });
			},
			setMarker: (marker?: Omit<ViewPointType, "zoom" | "info">) => {
				setState({ marker });
			},
			setSelectedMarker: async (selectedMarker?: SuggestionType) => {
				if (selectedMarker === undefined) {
					setState({ selectedMarker });
					return;
				}
				let coords;
				if (!selectedMarker.PlaceId) {
					const { Place } = selectedMarker;
					coords = Place?.Geometry.Point;
				} else {
					try {
						const pd = await placesService.getPlaceById(selectedMarker.PlaceId);
						coords = pd?.Place.Geometry.Point;
					} catch (error) {
						errorHandler(error, "Failed to fetch place by ID for marker");
					}
				}
				const [longitude, latitude] = coords as Position;
				const viewpoint = { longitude, latitude };
				setState({ viewpoint, selectedMarker, hoveredMarker: undefined });
			},
			setHoveredMarker: (hoveredMarker?: SuggestionType) => {
				setState({ hoveredMarker });
			},
			clearPoiList: () => {
				setState({
					suggestions: undefined,
					selectedMarker: undefined,
					marker: undefined,
					bound: undefined,
					clusters: undefined
				});
			},
			resetStore() {
				setState({
					bound: undefined,
					clusters: undefined,
					suggestions: undefined,
					selectedMarker: undefined,
					hoveredMarker: undefined,
					marker: undefined
				});
				setInitial();
			}
		}),
		[placesService, setState, store.precision, setInitial]
	);
	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default useAwsPlace;
