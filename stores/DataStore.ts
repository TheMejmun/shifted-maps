import {computed} from 'mobx';

import Connection from './Connection';
import {DiaryPlaceData, DiaryUserData} from './Diary';
import Place, {isPlaceData} from './Place';
import Stay, {isStayData} from './Stay';
import Trip, {isTripData} from './Trip';
import VisualisationStore from "./VisualisationStore";
import UIStore from "./UIStore";

export const DAY_IN_SEC = 60 * 60 * 24;

class DataStore {
    readonly ui: Readonly<UIStore>;
    readonly placesData: DiaryPlaceData;
    readonly userData: DiaryUserData;
    readonly friendData: DiaryUserData; // TODO stupid name, change later
    readonly publicData: DiaryUserData[]; // TODO stupid name, change later
    vis: VisualisationStore | undefined = undefined;


    constructor(ui: UIStore, places: DiaryPlaceData, user: DiaryUserData, friend: DiaryUserData, publicData: DiaryUserData[]) {
        this.ui = ui;
        this.placesData = places;
        this.userData = user;
        this.friendData = friend;
        this.publicData = publicData; // Cannot use public as variable name
    }

    @computed
    get newPlaces() {
        const placesAll: Place[] = [];

        this.placesData.forEach(item => {
            if (item.place != null && isPlaceData(item.place)) {
                const place = new Place(this, item.place)
                placesAll.push(place);
            }
        });
        return placesAll;
    }

    @computed
    get newStaysUser() {
        const staysUser: Stay[] = [];

        this.userData.forEach(item => {
            if (item.stay != null && isStayData(item.stay)) {
                staysUser.push(new Stay(this, item.stay));
            }
        });

        return staysUser;
    }

    @computed
    get newStaysFriend() {
        const staysFriend: Stay[] = [];

        // @ts-ignore
        const {withFriend} = this.vis.ui;
        if (!withFriend) {
            return staysFriend;
        }

        this.friendData.forEach(item => {
            if (item.stay != null && isStayData(item.stay)) {
                staysFriend.push(new Stay(this, item.stay));
            }
        });

        return staysFriend;
    }

    @computed
    get stays() {
        return this.newStaysUser.concat(this.newStaysFriend);
    }

    @computed
    get newTripsUser() {
        const tripsUser: Trip[] = [];

        this.userData.forEach(item => {
            if (item.trip != null && isTripData(item.trip)) {
                tripsUser.push(new Trip(this, item.trip));
            }
        });

        return tripsUser;
    }

    @computed
    get newTripsFriend() {
        const tripsFriend: Trip[] = [];

        // @ts-ignore
        const {withFriend} = this.vis.ui;
        if (!withFriend) {
            return tripsFriend;
        }

        this.friendData.forEach(item => {
            if (item.trip != null && isTripData(item.trip)) {
                tripsFriend.push(new Trip(this, item.trip));
            }
        });

        return tripsFriend;
    }

    @computed
    get newTripsPublic() {
        const tripsPublic: Trip[] = [];

        this.publicData.forEach(userData => {
                userData.forEach(item => {
                        if (item.trip != null && isTripData(item.trip)) {
                            tripsPublic.push(new Trip(this, item.trip));
                        }
                    }
                )
            }
        );

        return tripsPublic;
    }

    private pushTrips(connections: { [id: string]: Connection }, trips: Trip[]) {
        trips.forEach(trip => {
            // Ignore trips where start and end is at the same place.
            if (trip.from === trip.to || trip.from.latLng.equals(trip.to.latLng)) {
                return;
            }

            // Ignore tips where a to or from properties are not been resolved
            if (trip.from == null || trip.to == null) {
                return;
            }

            const id = Connection.createId(trip.from, trip.to, true);
            let connection = connections[id];

            if (connection == null) {
                connection = new Connection(this, id, trip.from, trip.to, true); // user connections
                connections[id] = connection;
            }

            connection.trips.push(trip);
        });
    }

    @computed
    get connectionsWithFriend() {
        const connections: { [id: string]: Connection } = {};

        this.pushTrips(connections, this.newTripsUser);

        // @ts-ignore
        const {withFriend} = this.vis.ui;
        if (withFriend) {
            this.pushTrips(connections, this.newTripsFriend);
        }

        return Object.values(connections);
    }

    @computed
    get connectionsMainUser() {
        const connections: { [id: string]: Connection } = {};

        this.pushTrips(connections, this.newTripsUser);

        return Object.values(connections);
    }

    @computed
    get connectionsOtherUsers() {
        const connections: { [id: string]: Connection } = {};

        this.pushTrips(connections, this.newTripsPublic);

        return Object.values(connections);
    }

    @computed
    get timeSpan()
        :
        ReadonlyArray<number> {
        return this.stays.reduce<[number, number]>(
            ([start, end], stay: Stay) => {
                if (stay.startAt < start) {
                    start = Math.floor(stay.startAt / DAY_IN_SEC) * DAY_IN_SEC;
                }

                if (stay.endAt > end) {
                    end = Math.ceil(stay.endAt / DAY_IN_SEC) * DAY_IN_SEC;
                }

                return [start, end];
            },
            [Infinity, -Infinity]
        );
    }

    @computed
    get visiblePlaces() {
        return this.newPlaces.filter(place => place.visible);
    }

    @computed
    get visibleConnections() {
        return this.connectionsMainUser.filter(connection => connection.visible);
    }

    @computed
    get totalConnectionDistance() {
        return this.visibleConnections.reduce((distance, connection) => {
            return distance + connection.totalVisibleDistance;
        }, 0);
    }

    @computed
    get averageConnectionDistance() {
        if (this.visibleConnections.length === 0) {
            return 0;
        }

        return this.totalConnectionDistance / this.visibleConnections.length;
    }

    @computed
    get totalConnectionDuration() {
        return this.visibleConnections.reduce((distance, connection) => {
            return distance + connection.totalVisibleDuration;
        }, 0);
    }

    @computed
    get averageConnectionDuration() {
        if (this.visibleConnections.length === 0) {
            return 0;
        }

        return this.totalConnectionDuration / this.visibleConnections.length;
    }

    @computed
    get totalConnectionFrequency() {
        return this.visibleConnections.reduce((distance, connection) => {
            return distance + connection.visibleFrequency;
        }, 0);
    }

    @computed
    get averageConnectionFrequency() {
        if (this.visibleConnections.length === 0) {
            return 0;
        }

        return this.totalConnectionFrequency / this.visibleConnections.length;
    }
}

export default DataStore;
