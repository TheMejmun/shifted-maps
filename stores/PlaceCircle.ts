import { computed, observable, action } from 'mobx';
import {
  Map as LeafletMap,
  bounds,
  latLngBounds,
  point,
  Point,
} from 'leaflet';
import orderBy from 'lodash/fp/orderBy';

import Place from './Place';
import VisualisationStore, {
  MAX_ZOOM,
  CRS,
} from './VisualisationStore';

export const sortByHoverRadius = orderBy<PlaceCircle>(
  ['hover', 'radius'],
  ['asc', 'asc']
);

class PlaceCircle {
  readonly vis: VisualisationStore;
  readonly place: Place;

  @observable
  hover: boolean = false;

  @observable.ref
  mapPoint: Point = point(0, 0);

  @observable.ref
  point: Point = point(0, 0);

  @observable
  animate: boolean = false;

  constructor(vis: VisualisationStore, place: Place) {
    this.vis = vis;
    this.place = place;
  }

  @action
  updateMapPoint(map: LeafletMap) {
    const { view } = this.vis.ui;
    const nextMapPoint = map.latLngToLayerPoint(this.place.latLng);

    this.mapPoint = nextMapPoint;

    if (view == null) {
      this.updatePoint(this.mapPoint);
    }
  }

  @action
  updateAnimate(animate: boolean) {
    this.animate = animate;
  }

  @action
  updatePoint(point: Point, round: boolean = false) {
    this.point = point[round ? 'round' : 'clone']();
  }

  @computed
  get key() {
    return this.place.id;
  }

  @computed
  get radius() {
    return this.vis.placeRadiusScale(this.place.visibleDuration);
  }

  @computed
  get diameter() {
    return this.radius * 2;
  }

  @computed
  get strokeWidth() {
    return this.vis.placeStrokeWidthScale(
      this.place.visibleFrequency
    );
  }

  @computed
  get parent(): PlaceCircle | undefined {
    let parent = this.vis.placeCircles.find(placeCircle => {
      if (placeCircle === this) {
        return false;
      }

      if (this.radius < placeCircle.radius) {
        const distance = this.mapPoint.distanceTo(
          placeCircle.mapPoint
        );
        const maxDistance = this.radius + placeCircle.radius;

        if (distance > maxDistance) {
          return false;
        }

        const overlap = maxDistance - distance;

        if (overlap / (this.radius * 2) >= 0.6) {
          return true;
        }
      }

      return false;
    });

    if (parent && parent.parent) {
      parent = parent.parent;
    }

    return parent;
  }

  @computed
  get children() {
    if (this.parent != null) {
      return [];
    }

    return this.vis.placeCircles.filter(
      placeCircle => placeCircle.parent === this
    );
  }

  @computed
  get latLngBounds() {
    if (this.children.length === 0) {
      return this.place.latLng.toBounds(400);
    }

    const bounds = latLngBounds([this.place.latLng]);

    this.children.forEach(placeCircle => {
      bounds.extend(placeCircle.place.latLng);
    });

    // The have the full bounds inside the place circle, we need to expand it by a factor of around 1.41.
    // 1.41 ≈ sqrt(pow(r, 2) + pow(r, 2)) / r
    return bounds.pad(1.41);
  }

  @computed
  get zoom() {
    const northWest = this.latLngBounds.getNorthWest();
    const southEast = this.latLngBounds.getSouthEast();
    let zoom = 1;
    let size;

    do {
      const topLeft = CRS.latLngToPoint(northWest, zoom);
      const bottomRight = CRS.latLngToPoint(southEast, zoom);

      size = bounds(topLeft, bottomRight).getSize();
    } while (
      (this.diameter > size.x || this.diameter > size.y) &&
      (zoom = zoom + 1) <= MAX_ZOOM
    );

    return zoom;
  }

  @computed
  get visible() {
    return this.parent == null && this.place.visible;
  }
}

export default PlaceCircle;