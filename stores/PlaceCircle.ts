import { bounds, point, Point } from 'leaflet';
import { computed, observable } from 'mobx';

import { CRS, MAX_ZOOM, PLACE_DOT_RADIUS_SCALE } from './config';
import Place from './Place';
import roundPoint from './utils/roundPoint';
import VisualisationStore from './VisualisationStore';

const roundPlaceCirclePoint = roundPoint(0.2);

class PlaceCircle {
  readonly vis: VisualisationStore;
  readonly place: Place;

  @observable.ref
  graphPoint: Point = point(0, 0);

  constructor(vis: VisualisationStore, place: Place) {
    this.vis = vis;
    this.place = place;
  }

  @computed
  get active() {
    return this.vis.activeElement === this;
  }

  @computed
  get highlight() {
    return this.active || this.connectionLines.some(connectionLine => connectionLine.highlight);
  }

  @computed
  get fade() {
    return !this.highlight && this.vis.activeElement != null;
  }

  @computed
  get mapPoint() {
    return this.vis.project(this.place.latLng);
  }

  @computed<Point>({
    equals(a, b) {
      return a.equals(b);
    },
  })
  get point() {
    return roundPlaceCirclePoint(this.graphPoint);
  }

  @computed
  get key() {
    return this.place.id;
  }

  @computed
  get radius() {
    return this.vis.placeCircleRadiusScale(this.place.visibleDuration);
    // return 200;
  }

  @computed
  get dotRadius() {
    if (this.vis.width == null) {
      throw new Error('Unknown width.');
    }

    return PLACE_DOT_RADIUS_SCALE(this.vis.width);
  }

  @computed
  get diameter() {
    return this.radius * 2;
  }

  @computed
  get strokeWidth() {
    return this.vis.placeStrokeWidthScale(this.place.visibleFrequency);
  }

  @computed
  get parent(): PlaceCircle | undefined {
    let parent = this.vis.placeCircles.find(placeCircle => {
      if (placeCircle === this || !placeCircle.place.visible) {
        return false;
      }

      if (this.radius <= placeCircle.radius) {
        const distance = this.mapPoint.distanceTo(placeCircle.mapPoint);
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
      placeCircle => placeCircle.place.visible && placeCircle.parent === this
    );
  }

  @computed
  get latLngBounds() {
    const bounds = this.place.latLng.toBounds(200);

    if (this.children.length === 0) {
      return bounds;
    }

    this.children.forEach(placeCircle => {
      bounds.extend(placeCircle.place.latLng.toBounds(200));
    });

    return bounds;
  }

  @computed
  get zoom() {
    const northWest = this.latLngBounds.getNorthWest();
    const southEast = this.latLngBounds.getSouthEast();
    let zoom = 0;
    let size;
    let diameter;

    do {
      zoom = zoom + 1;

      if (zoom > MAX_ZOOM) {
        break;
      }

      const topLeft = CRS.latLngToPoint(northWest, zoom);
      const bottomRight = CRS.latLngToPoint(southEast, zoom);

      size = bounds(topLeft, bottomRight).getSize();
      diameter = Math.sqrt(Math.pow(size.x, 2) + Math.pow(size.y, 2));
    } while (this.diameter > diameter);

    return zoom - 1;
  }

  @computed
  get dots() {
    const center = CRS.latLngToPoint(this.latLngBounds.getCenter(), this.zoom);

    return [...this.children, this].map(placeCircle =>
      CRS.latLngToPoint(placeCircle.place.latLng, this.zoom).subtract(center)
    );
  }

  @computed
  get visible() {
    return this.parent == null && this.place.visible;
    // return true
  }

  @computed
  get connectionLines() {
    return this.vis.connectionLines.filter(
      connectionLine => connectionLine.from === this || connectionLine.to === this
    );
  }
}

export default PlaceCircle;
