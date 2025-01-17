import { computed } from 'mobx';

import DataStore from './DataStore';

export interface ITripData {
  readonly from: number;
  readonly to: number;
  readonly startAt: number;
  readonly endAt: number;
  readonly distance: number;
  readonly duration: number;
}

export function isTripData(value: any): value is ITripData {
  return (
    value.from != null &&
    value.to != null &&
    value.startAt != null &&
    value.endAt != null &&
    value.distance != null &&
    value.duration != null
  );
}

class Trip {
  readonly store: DataStore;
  readonly fromPlaceId: number;
  readonly toPlaceId: number;
  readonly startAt: number;
  readonly endAt: number;
  readonly distance: number;
  readonly duration: number;

  constructor(store: DataStore, data: ITripData) {
    this.store = store;

    this.fromPlaceId = data.from;
    this.toPlaceId = data.to;
    this.startAt = data.startAt;
    this.endAt = data.endAt;
    this.distance = data.distance;
    this.duration = data.duration;
  }

  @computed
  get from() {
    const from = this.store.newPlaces.find(place => place.id === this.fromPlaceId);

    if (from == null) {
      throw new Error('Missing place.');
    }

    return from;
  }

  @computed
  get to() {
    const to = this.store.newPlaces.find(place => place.id === this.toPlaceId);

    if (to == null) {
      throw new Error('Missing place.');
    }

    return to;
  }

  @computed
  get visible() {
    const { timeSpan } = this.store.ui;

    if (timeSpan == null) {
      return true;
    }

    const [start, end] = timeSpan;

    return this.startAt >= start && this.endAt <= end;
  }
}

export default Trip;
