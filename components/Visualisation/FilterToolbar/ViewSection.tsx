import { observer } from 'mobx-react';
import { transparentize } from 'polished';
import styled from 'styled-components';
import { VIEW } from '../../../stores/UIStore';
import { ViewItem, VIEW_LIST } from './config';
import ViewButton from './ViewButton';
import React  from 'react';

import ToggleContext from './ToggleContext';

interface ViewSectionProps {
  className?: string;
  onViewChange: (view?: VIEW) => void;
  activeViewItem: ViewItem;
}

const ViewSection = observer((props: ViewSectionProps) => {
  const { className, activeViewItem, onViewChange } = props;

    const legendItemStyle = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        marginTop: '10px'
    };

    const colorCircleStyle = {
        backgroundColor: '#2B2A4C',
        color: 'white',
        padding: '8px',
        borderRadius: '50%',
        marginRight: '10px',
    };

  return (
    <section className={className}>
      <ViewList>
        {VIEW_LIST.map((viewItem, index) => (
          <ViewButton key={index} onClick={onViewChange} active={activeViewItem === viewItem} viewItem={viewItem} />
        ))}
      </ViewList>
      <ViewInfo>
        <ViewName>
            {activeViewItem.name}</ViewName>
        <ViewText>{activeViewItem.text}</ViewText>
      </ViewInfo>
        <ViewInfo>
            <ViewName>
                Comparison
            </ViewName>
            <ToggleButton />
            <ViewText>
                If toggled compares your movement data with your friend.
            </ViewText>
            <div style={legendItemStyle}>
                <span style={colorCircleStyle}></span> Friend
            </div>
            <div style={legendItemStyle}>
                <span style={{ ...colorCircleStyle, backgroundColor: '#EA906C' }}></span> User
            </div>
        </ViewInfo>
    </section>
  );
});

const ToggleButton = () => {
    const { isToggled, setToggled } = React.useContext(ToggleContext);

    const handleToggle = () => {
        setToggled(!isToggled);
    };

    return (
        <ToggleContainer onClick={handleToggle} isToggled={isToggled}>
            <ToggleSlider isToggled={isToggled} />
        </ToggleContainer>
    );
};

export default styled(ViewSection)`
  grid-area: view;
  margin-top: ${props => props.theme.spacingUnit * 1.5}px;

  @media (min-width: 440px) {
    margin-top: ${props => props.theme.spacingUnit * 0.75}px;
  }

  @media (min-width: 580px) {
    margin-top: ${props => props.theme.spacingUnit * 1.5}px;
  }
`;

const ViewList = styled.div`
  display: flex;
  justify-content: space-between;

  @media (min-width: 440px) {
    justify-content: flex-start;
  }

  @media (min-width: 580px) {
    justify-content: space-between;
  }
`;

const ViewInfo = styled.div`
  margin-top: ${props => props.theme.spacingUnit * 1}px;
`;

const ViewName = styled.strong`
  margin-right: ${props => props.theme.spacingUnit * 0.75}px;
  color: ${props => props.theme.highlightColor};
`;

const ViewText = styled.p`
  color: ${props => transparentize(0.4, props.theme.foregroundColor)};
`;

const ToggleContainer = styled.label<{ isToggled: boolean }>`
  display: inline-block;
  width: 30px;
  height: 15px;
  background-color: ${props => (props.isToggled ? props.theme.highlightColor : props.theme.foregroundColor)};
  border-radius: 34px;
  cursor: pointer;
`;

const ToggleSlider = styled.span<{ isToggled: boolean }>`
  position: relative;
  display: block;
  width: 15px;
  height: 15px;
  background-color: #fff;
  border-radius: 50%;
  transition: 0.4s;
  transform: translateX(${props => (props.isToggled ? '15px' : '0')});
`;
