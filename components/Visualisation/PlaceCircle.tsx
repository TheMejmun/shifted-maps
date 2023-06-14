import classNames from 'classnames';
import { observer } from 'mobx-react';
import React, {MouseEvent} from 'react';
import styled from 'styled-components';
import useAutorunRef from '../../hooks/useAutorunRef';
import PlaceCircleModel from '../../stores/PlaceCircle';
import VisualisationStore from '../../stores/VisualisationStore';
import PlaceCircleLabel from './PlaceCircleLabel';
import PlaceCircleMap from './PlaceCircleMap';
import { DEVICE } from './Visualisation';

interface PlaceCircleProps {
  placeCircle: PlaceCircleModel;
  vis: VisualisationStore;
  className?: string;
  touch: boolean;
  device: DEVICE;
}

const PlaceCircle = observer(({ placeCircle, className, vis, touch, device }: PlaceCircleProps) => {
  const { radius, strokeWidth, active, visible, fade } = placeCircle;
  const ref = useAutorunRef(
    (element: SVGGElement) => {
      const { point } = placeCircle;

      element.setAttribute('transform', `translate(${point.x}, ${point.y})`);
    },
    [placeCircle]
  );

  const toggle = (active?: boolean) => {
    vis.toggle(placeCircle, active);
  };

  const getRandomRatio = () => {
    return Math.random().toFixed(2);
  };

  const ratio = getRandomRatio();

  // @ts-ignore
  return (
    <g
      ref={ref}
      className={classNames(className, { fade })}
      {...(!touch
        ? {
            onMouseEnter: () => toggle(true),
            onMouseLeave: () => toggle(false),
          }
        : {
            onClick: (event: MouseEvent<SVGGElement>) => {
              event.stopPropagation();
              toggle();
            },
          })}
    >
      {visible && (
          <>
            <PlaceCircleBackground r={radius} />
            <PlaceCircleMap placeCircle={placeCircle} vis={vis} />
            {/*<PlaceCircleStroke*/}
            {/*    r={radius}*/}
            {/*    style={{ strokeWidth: `${strokeWidth}px` }}*/}
            {/*    className={classNames({ highlight: active })}*/}
            {/*/>*/}
            TODO make these circles below a styled component
            <circle r={radius} stroke="#2B2A4C" strokeWidth="8" fill="none" />
            <circle
                r={radius}
                stroke="#EA906C"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`calc(2 * 3.14159 * ${radius} * ${ratio}) calc(2 * 3.14159 * ${radius} * ${1 - ratio})`}
                strokeDashoffset={`calc(2 * 3.14159 * ${radius} * ${1 - ratio})`}
            />
            <PlaceCircleLabel placeCircle={placeCircle} device={device} />
          </>
      )}
    </g>
  );
});

export default styled(PlaceCircle)`
  will-change: transform, opacity;
  pointer-events: auto;
  transition: opacity ${props => props.theme.transitionDuration};
  opacity: 1;

  &.fade {
    opacity: 0.2;
  }

  .leaflet-dragging & {
    cursor: move;
    cursor: grabbing;
  }
`;

const PlaceCircleBackground = styled.circle`
  fill: ${props => props.theme.backgroundColor};
  stroke: none;
`;

// const PlaceCircleStroke = styled.circle`
//   transition: stroke ${props => props.theme.shortTransitionDuration};
//   fill: none;
//   stroke: ${props => props.theme.foregroundColor};
//
//   &.highlight {
//     stroke: ${props => props.theme.highlightColor};
//   }
// `;

const UserCircle = styled.circle`
  transition: stroke ${props => props.theme.shortTransitionDuration};
  fill: none;
  stroke: blue;
  stroke-width: 8;
  &.highlight {
    stroke: ${props => props.theme.highlightColor};
  }
`;

// const FriendCircle = styled.circle`
//   transition: stroke ${props => props.theme.shortTransitionDuration};
//   fill: none;
//   stroke: red;
//   stroke-width: 8;
//   stroke-dasharray: ${props => `calc(2 * 3.14159 * ${props.radius} * 0.6) calc(2 * 3.14159 * ${props.radius} * 0.4)`};
//   stroke-dashoffset: ${props => `calc(2 * 3.14159 * ${props.radius} * 0.4)`};
//   &.highlight {
//     stroke: ${props => props.theme.highlightColor};
//   }
// `;
