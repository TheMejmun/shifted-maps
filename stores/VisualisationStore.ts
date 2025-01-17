import {scaleLinear, scalePow} from 'd3-scale';
import {CRS as LeafletCRS, LatLng, latLngBounds, Map as LeafletMap, Point} from 'leaflet';
import debounce from 'lodash/fp/debounce';
import reverse from 'lodash/fp/reverse';
import {action, computed, observable} from 'mobx';

import {
    createConnectionStrokeWidthRangeScale,
    createPlaceRadiusRangeScale,
    createPlaceStrokeWidthRangeScale,
    MAX_ZOOM,
} from './config';
import Connection from './Connection';
import ConnectionLine from './ConnectionLine';
import DataStore from './DataStore';
import GraphStore from './GraphStore';
import PlaceCircle from './PlaceCircle';
import PlaceCircleNode from './PlaceCircleNode';
import UIStore from './UIStore';
import extent from './utils/extent';
import sortVisualisationElements from './utils/sortVisualisationElements';

export type VisualisationElement = PlaceCircle | ConnectionLine;

class VisualisationStore {
    readonly data: DataStore;
    readonly graph: GraphStore;
    readonly ui: Readonly<UIStore>;

    @observable
    pixelOrigin?: Point;

    @observable
    zoom?: number;

    @observable
    activeElement: VisualisationElement | null = null;

    @observable
    width?: number;

    @observable
    maxPlaceCircleRadius?: number;

    toggle = debounce(50)(
        action((element: VisualisationElement, active: boolean = !element.active) => {
            this.activeElement = active ? element : null;
        })
    );

    private placeCirclesCache: PlaceCircle[] = [];
    private connectionLinesCache: ConnectionLine[] = [];

    @observable
    private crs?: LeafletCRS;

    @observable
    private minZoom?: number;

    @observable
    private maxZoom?: number;

    constructor(ui: UIStore, data: DataStore) {
        this.ui = ui;
        this.data = data;

        this.graph = new GraphStore(this, this.handleGraphTick, this.handleGraphEnd);
    }

    @action
    handleGraphTick = (nodes: PlaceCircleNode[]) => {
        nodes.forEach(node => {
            node.placeCircle.graphPoint = node.clone();
        });
    };

    @action
    handleGraphEnd = (nodes: PlaceCircleNode[]) => {
        nodes.forEach(node => {
            node.placeCircle.graphPoint = node.round();
        });
    };

    @action
    updateProjection(map: LeafletMap) {
        this.crs = map.options.crs;
        this.zoom = map.getZoom();
        this.minZoom = map.getMinZoom();
        this.maxZoom = Math.min(MAX_ZOOM, map.getMaxZoom());

        const pixelOrigin = map.getPixelOrigin();

        if (this.pixelOrigin == null || !this.pixelOrigin.equals(pixelOrigin)) {
            this.pixelOrigin = pixelOrigin;
        }
    }

    @action
    updateWidth(width: number) {
        this.width = width;

        let maxPlaceCircleRadius = createPlaceRadiusRangeScale(width).range()[1][1];

        if (this.maxPlaceCircleRadius != null) {
            maxPlaceCircleRadius = Math.max(maxPlaceCircleRadius, this.maxPlaceCircleRadius);
        }

        this.maxPlaceCircleRadius = Math.ceil(maxPlaceCircleRadius);
    }

    @action
    deactivateElement() {
        this.activeElement = null;
    }

    dispose() {
        this.graph.dispose();
        this.toggle.cancel();
    }

    @computed
    get ready() {
        return this.pixelOrigin != null && this.zoom != null && this.width != null;
    }

    @computed
    get zoomScale() {
        if (this.maxZoom == null || this.minZoom == null) {
            return;
        }

        return scaleLinear().domain([this.minZoom, this.maxZoom]);
    }

    @computed
    get scale() {
        if (this.zoomScale == null || this.zoom == null) {
            return;
        }

        return this.zoomScale(this.zoom);
    }

    @computed
    get placeCircles() { // here change places to have different colors
        const placeCircles: PlaceCircle[] = [];

        this.data.newPlaces.forEach(place => {
            let placeCircle = this.placeCirclesCache.find(placeCircle => placeCircle.place === place);

            if (placeCircle == null) {
                placeCircle = new PlaceCircle(this, place);
            }

            placeCircles.push(placeCircle);
        });
        return (this.placeCirclesCache = placeCircles);
    }

    private pushConnections(data: Connection[], isOther: boolean) {

        data.forEach(connection => {
            let from = this.placeCircles.find(placeCircle => placeCircle.place.id === connection.from.id);
            let to = this.placeCircles.find(placeCircle => placeCircle.place.id === connection.to.id);
            const user = connection.user;

            if (from == null || to == null) {
                throw new Error('Missing place circle');
            }

            if (from.parent != null) {
                from = from.parent;
            }

            if (to.parent != null) {
                to = to.parent;
            }

            // Link inside a place cluster
            if (from.place === to.place) {
                return;
            }

            const key = Connection.createId(from.place, to.place, user);
            let connectionLineIndex = this.connectionLinesCache
                .map(connectionLine => connectionLine.key)
                .indexOf(key);

            // Do not create a new connection, if the main user does not use it!!
            if (connectionLineIndex >= 0 || !isOther) {
                if (connectionLineIndex < 0) {
                    this.connectionLinesCache.push(new ConnectionLine(this, key, from, to, this.data.publicData.length));
                    connectionLineIndex = this.connectionLinesCache.length - 1
                }

                const connectionLine = this.connectionLinesCache[connectionLineIndex];

                if (isOther) {
                    connectionLine.connectionsOthers.push(connection);
                } else {
                    connectionLine.connections.push(connection);
                }
            }
        });
    }

     static clearArray<T>(array: T[]) {
        while (array.length > 0) {
            array.pop();
        }
    }

    @computed
    get connectionLines() {
        // Clear all connections to start with empty connection lines if reused.
        VisualisationStore.clearArray(this.connectionLinesCache);
        // this.connectionLinesCache.forEach(connectionLine => {
        //     VisualisationStore.clearArray(connectionLine.connections);
        //     VisualisationStore.clearArray(connectionLine.connectionsOthers);
        // });

        // Main user has to be added first!
        // TODO not with friend?
        this.pushConnections(this.data.connectionsWithFriend, false);
        this.pushConnections(this.data.connectionsOtherUsers, true);

        return this.connectionLinesCache
    }


    @computed
    get initialBounds() {
        const emptyBounds = latLngBounds([]);

        if (this.data.newPlaces.length === 0) {
            return emptyBounds;
        }

        return this.data.newPlaces
            .reduce((bounds, place) => {
                bounds.extend(place.latLng);

                return bounds;
            }, emptyBounds)
            .pad(0.1);
    }

    @computed
    get elements() {
        return sortVisualisationElements([...this.placeCircles, ...this.connectionLines]);
    }

    @computed
    get visiblePlaceCircles() {
        return this.placeCircles.filter(placeCircle => placeCircle.visible);
    }

    @computed
    get visibleConnectionLines() {
        return this.connectionLines.filter(connectionLines => connectionLines.visible);
    }

    @computed
    get placeStrokeWidthScale() {
        const domain = extent('visibleFrequency')(this.data.visiblePlaces);

        const scale = scalePow()
            .exponent(0.5)
            .domain(domain);

        if (this.scale != null) {
            if (this.width == null) {
                throw new Error('Width unknown.');
            }

            const range = createPlaceStrokeWidthRangeScale(this.width)(this.scale);

            scale.range(range);
        }

        return scale;
    }

    @computed
    get placeCircleRadiusScale() {
        const domain = extent('visibleDuration')(this.data.visiblePlaces);

        const scale = scalePow()
            .exponent(0.5)
            .domain(domain);

        if (this.scale != null) {
            if (this.width == null) {
                throw new Error('Width unknown.');
            }

            const range = createPlaceRadiusRangeScale(this.width)(this.scale);

            scale.range(range);
        }

        return scale;
    }

    @computed
    get connectionStrokeWidthScale() {
        const domain = this.connectionLineFrequencyDomain;

        const scale = scalePow()
            .exponent(0.25)
            .domain(domain);

        if (this.scale != null) {
            if (this.width == null) {
                throw new Error('Width unknown.');
            }

            let range = createConnectionStrokeWidthRangeScale(this.width)(this.scale);

            // In case there is only one connection line, make the higher range the default stroke width.
            if (domain[0] === domain[1]) {
                range = [range[1], range[1]];
            }

            scale.range(range);
        }

        return scale;
    }

    @computed
    get connectionLineDistanceDomain() {
        return extent('visibleDistance')(this.visibleConnectionLines);
    }

    @computed
    get connectionLineDurationDomain() {
        return extent('visibleDuration')(this.visibleConnectionLines);
    }

    @computed
    get connectionLineFrequencyDomain() {
        return extent('visibleFrequency')(this.visibleConnectionLines);
    }

    @computed
    get connectionLineRelativeFrequencyDomain() {
        return extent('visibleRelativeFrequency')(this.visibleConnectionLines);
    }

    @computed
    get connectionLineBeelineScale() {
        const beelineExtent = extent('beeline');

        return scaleLinear()
            .domain(beelineExtent(this.data.connectionsWithFriend))
            .range(beelineExtent(this.connectionLines));
    }

    @computed
    get connectionLineDurationDistanceScale() {
        return scaleLinear()
            .domain(this.connectionLineDurationDomain)
            .range(this.connectionLineDistanceDomain);
    }

    @computed
    get connectionLineFrequencyDistanceScale() {
        const range = this.connectionLineDistanceDomain;

        return scalePow()
            .exponent(0.5)
            .domain(reverse(this.connectionLineFrequencyDomain))
            .range([range[0], range[1] * 0.75]);
    }

    @computed
    get connectionLineRelativeFrequencyDistanceScale() {
        const range = this.connectionLineDistanceDomain;

        return scalePow()
            .exponent(0.1)
            .domain(reverse(this.connectionLineRelativeFrequencyDomain))
            .range([range[0] / 2, range[1] / 2]);
    }

    project(latLng: LatLng, zoom: number | undefined = this.zoom, pixelOrigin: Point | undefined = this.pixelOrigin) {
        if (this.crs == null) {
            throw new Error('No CRS.');
        }

        if (zoom == null || pixelOrigin == null) {
            throw new Error('Cannot calculate point without zoom or pixel origin.');
        }

        return this.crs.latLngToPoint(latLng, zoom).subtract(pixelOrigin);
    }

    unproject(point: Point, zoom: number | undefined = this.zoom, pixelOrigin: Point | undefined = this.pixelOrigin) {
        if (this.crs == null) {
            throw new Error('No CRS.');
        }

        if (zoom == null || pixelOrigin == null) {
            throw new Error('Cannot calculate latLng without zoom or pixel origin.');
        }

        return this.crs.pointToLatLng(point.add(pixelOrigin), zoom);
    }
}

export default VisualisationStore;
