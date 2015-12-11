import without from 'lodash/array/without';
import moment from 'moment';
import trackEvent from '../services/track-event';

export const CHANGE_VIEW = 'CHANGE_VIEW';
export const SET_LOCATIONS = 'SET_LOCATIONS';
export const CHANGE_TIME_SPAN = 'CHANGE_TIME_SPAN';
export const HOVER_PLACE = 'HOVER_PLACE';
export const CLOSE_INTERACTION_OVERLAY = 'CLOSE_INTERACTION_OVERLAY';

export function changeView(view) {
  trackEvent('ui', 'change', 'view', view);

  return { type: CHANGE_VIEW, view };
}

export function changeTimeSpan(timeSpan) {
  let [ start, end ] = timeSpan;

  trackEvent('ui', 'filter', 'time span', moment(start).format('YYYY-MM-DD') + '-' + moment(end).format('YYYY-MM-DD'));

  return { type: CHANGE_TIME_SPAN, timeSpan };
}

export function hoverPlace(placeId, hover) {
  return { type: HOVER_PLACE, placeId, hover };
}

export function closeInteractionOverlay() {
  return { type: CLOSE_INTERACTION_OVERLAY };
}