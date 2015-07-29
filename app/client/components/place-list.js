var Reflux = require('reflux'),
  React = require('react'),
  Immutable = require('immutable'),
  nodesStore = require('../stores/nodes'),
  clustersStore = require('../stores/clusters'),
  tilesStore = require('../stores/tiles'),
  PlaceMap = require('./place-map'),
  PlaceDeco = require('./place-deco'),
  PlaceLabel = require('./place-label');

module.exports = React.createClass({
  mixins: [
    Reflux.connect(nodesStore, 'nodes'),
    Reflux.connect(clustersStore, 'clusters'),
    Reflux.connect(tilesStore, 'tiles')
  ],

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.nodes !== nextState.nodes || !Immutable.is(this.state.tiles, nextState.tiles);
  },

  render: function() {
    var places = [],
      clusters = this.state.clusters,
      tiles = this.state.tiles;

    this.state.nodes.forEach(function(node, key) {
      var primary = clusters.has(key),
        className = 'place';

      if (primary)
        className += ' primary';

      places.push(
        <g className={className} key={key}>
          <PlaceMap node={node} primary={primary} tile={tiles.get(key)} />
          <PlaceDeco node={node} primary={primary} />
          <PlaceLabel node={node} primary={primary} />
        </g>
      );
    });

    return <g className="place-list">{places}</g>;
  }
});