import dynamic from 'next/dynamic';
import {useRouter} from 'next/router';
import React, {useCallback} from 'react';
import {MapView} from '../components/Visualisation/Visualisation';
import { ToggleProvider } from '../components/Visualisation/FilterToolbar/ToggleContext';
import anton from '../data/anton.json';
import jihae from '../data/jihae.json';
import lucija from '../data/lucija.json';
import phil from '../data/phil.json';
import sam from '../data/sam.json';
import saman from '../data/saman.json';
import places from '../data/places.json';
import {VIEW} from '../stores/UIStore';

const DynamicVisualisation = dynamic({
    loader: () => import('../components/Visualisation/Visualisation'),
    loading: () => null,
    ssr: false,
});
// TODO issues with double rendering Datastore? Cycle
const Map = () => {
    const router = useRouter();
    let view: VIEW | undefined;
    let timeSpan: ReadonlyArray<number> | undefined;
    let mapView: MapView | undefined;

    if (typeof router.query.timeSpan === 'string') {
        const [start, end] = router.query.timeSpan.split('-');

        if (start != null && end != null) {
            timeSpan = [Number(start), Number(end)];
        }
    }

    if (typeof router.query.view === 'string') {
        view = VIEW[router.query.view.toUpperCase()];
    }

    if (typeof router.query.center === 'string' && typeof router.query.zoom === 'string') {
        const [lat, lng] = router.query.center.split(',');

        if (lat != null && lng != null) {
            mapView = {
                center: [Number(lat), Number(lng)],
                zoom: Number(router.query.zoom),
            };
        }
    }

    const handleViewChange = useCallback(
        (view?: VIEW) => {
            const query: { view?: string } = {
                ...router.query,
            };

            if (view != null) {
                query.view = VIEW[view].toLowerCase();
            } else {
                delete query.view;
            }

            router.push({pathname: '/map', query});
        },
        [router]
    );

    const handleTimeSpanChange = useCallback(
        (timeSpan: ReadonlyArray<number>) => {
            router.push({
                pathname: '/map',
                query: {
                    ...router.query,
                    timeSpan: timeSpan.join('-'),
                },
            });
        },
        [router]
    );


    // const handleWithFriendChange = useCallback(
    //     (withFriend: boolean) => {
    //         router.push({
    //             pathname: '/map',
    //             query: {
    //                 ...router.query,
    //                 withFriend: withFriend,
    //             },
    //         });
    //     },
    //     [router]
    // );

    const handleMapViewChange = useCallback(
        ({center, zoom}: MapView) => {
            const query = {
                center: center.join(','),
                zoom: String(zoom),
            };

            router.push({
                pathname: '/map',
                query: {
                    ...router.query,
                    ...query,
                },
            });
        },
        [router]
    );
    return (
        <ToggleProvider>
            <DynamicVisualisation
                placesData={places}
                userData={saman}
                friendData={lucija}
                publicData={[anton, jihae, lucija, phil, sam]}
                view={view}
                timeSpan={timeSpan}
                mapView={mapView}
                onViewChange={handleViewChange}
                onTimeSpanChange={handleTimeSpanChange}
                onMapViewChange={handleMapViewChange}
            />
        </ToggleProvider>
    );
};

export default Map;
