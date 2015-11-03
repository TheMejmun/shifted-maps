import { Map } from 'immutable';
import { DONE_STORYLINE_REQUEST, ADD_STAYS, } from '../actions/storyline';
import { CHANGE_TIME_SPAN, CHANGE_VIEW, SET_LOCATIONS, HOVER_PLACE, CLOSE_INTERACTION_OVERLAY } from '../actions/ui';
import { GEOGRAPHIC_VIEW } from '../models/views';

const DAY = 1000 * 60 * 60 * 24;

const DEFAULT_STATE = Map({
  authorized: ENV.authorized,
  storylineLoaded: false,
  timeSpanStep: DAY, // TODO Model or global const
  timeSpanRange: [Infinity, -Infinity],
  timeSpan: [],
  interactionOverlay: true
});

function addStays(state, action) {
  let { stays } = action,
    [ start, end ] = state.get('timeSpanRange');

  let day = state.get('timeSpanStep');

  stays.forEach(function(stay) {
    if (stay.startAt < start)
      start = Math.floor(stay.startAt / day) * day;

    if (stay.endAt > end)
      end = Math.ceil(stay.endAt / day) * day;
  });

  let range = [ start, end ];

  return state.withMutations(function(state) {
    state.set('timeSpanRange', range);
    state.set('timeSpan', range);
  });
}

function doneStorylineRequest(state, action) {
  return state.set('storylineLoaded', true);
}

function changeTimeSpan(state, action) {
  let { timeSpan } = action;

  return state.set('timeSpan', timeSpan);
}

function changeView(state, action) {
  let { view } = action;

  return state.set('activeView', view);
}

function setLocations(state, action) {
  let { view, locations } = action;

  return state.mergeIn(['locations', view], locations);
}

function setHoveredPlace(state, action) {
  let { placeId, hover } = action;

  return state.merge({
    hoveredPlaceId: placeId,
    hover
  });
}

function closeInteractionOverlay(state, action) {
  return state.set('interactionOverlay', false);
}

export default function ui(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case ADD_STAYS:
      return addStays(state, action);

    case DONE_STORYLINE_REQUEST:
      return doneStorylineRequest(state, action);

    case CHANGE_TIME_SPAN:
      return changeTimeSpan(state, action);

    case CHANGE_VIEW:
      return changeView(state, action);

    case SET_LOCATIONS:
      return setLocations(state, action);

    case HOVER_PLACE:
      return setHoveredPlace(state, action);

    case CLOSE_INTERACTION_OVERLAY:
      return closeInteractionOverlay(state, action);

    default:
      return state;
  }
}