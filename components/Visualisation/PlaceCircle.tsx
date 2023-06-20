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

import ToggleContext from './FilterToolbar/ToggleContext';

interface PlaceCircleProps {
  placeCircle: PlaceCircleModel;
  vis: VisualisationStore;
  className?: string;
  touch: boolean;
  device: DEVICE;
}

const PlaceCircle = observer(({ placeCircle, className, vis, touch, device }: PlaceCircleProps) => {
  const { radius, visible, fade } = placeCircle;
  const { isToggled } = React.useContext(ToggleContext);
  const ratio = placeCircle.place.ratio === undefined ? 0 : placeCircle.place.ratio;
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
          {!isToggled ? (
              <>
                <PlaceCircleBackground r={radius} />
                <PlaceCircleMap placeCircle={placeCircle} vis={vis} />
                <circle r={radius} stroke="#333333" strokeWidth="8" fill="none" />
                <PlaceCircleLabel placeCircle={placeCircle} device={device} />
              </>
            ) : (
              <>
                <PlaceCircleBackground r={radius} />
                <PlaceCircleMap placeCircle={placeCircle} vis={vis} />
                <circle r={radius} stroke="#2963a5" strokeWidth="8" fill="none" />
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

