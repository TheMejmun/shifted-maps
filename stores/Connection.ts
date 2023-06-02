import { computed } from 'mobx';

import DataStore from './DataStore';
import Place from './Place';
import Trip from './Trip';

class Connection {
  static createId(from: Place, to: Place, user: boolean): string { // True = user, False = friend
    if (from === to) {
      throw new Error('Cannot create id with same places.');
    }

    if (from.id < to.id) {
      return `${from.id}-${to.id}`;
    }

    return this.createId(to, from, user);
  }

  readonly store: DataStore;
  readonly id: string;
  readonly from: Place;
  readonly to: Place;
  readonly trips: Trip[] = [];
  readonly user: boolean

  constructor(store: DataStore, id: string, from: Place, to: Place, user: boolean) {
    this.store = store;

    this.id = id;
    this.from = from;
    this.to = to;

    this.user = user
  }

  @computed
  get visibleTrips() {
    return this.trips.filter(trip => trip.visible);
  }

  @computed
  get visible() {
    return this.visibleTrips.length > 0;
  }

  @computed
  get totalVisibleDistance() {
    return this.visibleTrips.reduce((distance, trip) => {
      return distance + trip.distance;
    }, 0);
  }

  @computed
  get visibleDistance() {
    if (this.visibleTrips.length === 0) {
      return 0;
    }

    return this.totalVisibleDistance / this.visibleTrips.length;
  }

  @computed
  get totalVisibleDuration() {
    return this.visibleTrips.reduce((duration, trip) => {
      return duration + trip.duration;
    }, 0);
  }

  @computed
  get visibleDuration() {
    if (this.visibleTrips.length === 0) {
      return 0;
    }

    return this.totalVisibleDuration / this.visibleTrips.length;
  }

  @computed
  get frequency() {
    return this.trips.length;
  }

  @computed
  get visibleFrequency() {
    return this.visibleTrips.length;
  }

  @computed
  get beeline() {
    return this.from.latLng.distanceTo(this.to.latLng);
  }
}

export default Connection;
