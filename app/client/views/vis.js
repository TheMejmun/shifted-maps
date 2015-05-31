var Backbone = require('backbone'),
  d3 = require('d3'),
  _ = require('underscore'),
  Place = require('../models/place'),
  Visit = require('../models/visit'),
  Connection = require('../models/connection'),
  Trip = require('../models/trip');

var VisView = Backbone.View.extend({
  initialize: function(options) {
    this._places = new Place.Collection();
    this._visits = new Visit.Collection();
    this._connection = new Connection.Collection();
    this._trips = new Trip.Collection();
    this._state = options.state;
    this._mapView = options.mapView;

    var vis = this;

    Backbone.$
      .when(
        this._places.fetch(), this._visits.fetch(),
        this._connection.fetch(), this._trips.fetch()
      )
      .then(function() {
        vis.render();
      });
  },

  render: function() {
    /*this._svg = d3.select(this.el).select('svg');
    this._placeRadiusScale = d3.scale.pow().exponent(.1).range([5, 50]);

    this.listenTo(this._mapView, 'zoomend', this.update);*/

    return this.update();
  },

  update: function() {
    /*var vis = this;

    var placeCircles = this._svg.selectAll('circle')
      .data(this._places.toJSON(), function(d) { return d._id; });

    placeCircles.enter()
      .append('circle');

    placeCircles
      .attr('r', function(d) {
        console.log(vis._placeRadiusScale(d.relativeDuration));
        return vis._placeRadiusScale(d.relativeDuration);
      })
      .attr('cx', function(d) {
        d.point = vis._state.placePoint(d);

        return d.point.x;
      })
      .attr('cy', function(d) {
        return d.point.y;
      });*/

    return this;
  },

  nodes: function() {
    return this._places.map(function(place) {
      place.getDuration()
    });
  }
});

module.exports = VisView;