import { latLng } from 'leaflet';
import { computed } from 'mobx';

import DataStore from './DataStore';

export interface IPlaceData {
  readonly id: number;
  readonly location: ILocation;
  readonly name: string;
}

export interface ILocation {
  readonly lat: number;
  readonly lon: number;
}

export function isPlaceData(value: any): value is IPlaceData {
  return value.id != null && value.location != null && value.name != null;
}

class Place {
  readonly store: DataStore;
  readonly id: number;
  readonly location: ILocation;
  readonly name: string;
  ratio: number | undefined; // user stays / friend stays

  constructor(store: DataStore, data: IPlaceData) {
    this.store = store;

    this.id = data.id;
    this.location = data.location;
    this.name = data.name;
  }

  @computed
  get latLng() {
    const { lat, lon } = this.location;

    return latLng({ lat, lng: lon });
  }

  @computed
  get stays() {
    const userStays = this.store.newStaysUser.filter(stay => stay.at === this);
    const friendStays = this.store.newStaysFriend.filter(stay => stay.at === this);
    this.ratio = userStays.length / friendStays.length

    return userStays.concat(friendStays) // all stays at a place
  }

  @computed
  get visibleStays() {
    return this.stays.filter(stay => stay.visible);
  }

  @computed
  get duration() {
    return this.stays.reduce((duration, stay) => duration + stay.duration, 0);
  }

  @computed
  get visibleDuration() {
    return this.visibleStays.reduce((duration, stay) => duration + stay.duration, 0);
  }

  @computed
  get frequency() {
    return this.stays.length;
  }

  @computed
  get visibleFrequency() {
    return this.visibleStays.length;
  }

  @computed
  get visible() {
    return this.visibleStays.length > 0;
  }
}

export default Place;
