import { observer } from 'mobx-react';
import { Component } from 'react';

import VisualisationStore from '../../stores/VisualisationStore';
import SVGLayer from './SVGLayer';
import VisualisationElementList from './VisualisationElementList';

interface IProps {
  vis: VisualisationStore;
}

@observer
class SVGVisualisationLayer extends Component<IProps> {
  render() {
    const { vis } = this.props;

    if (!vis.ready) {
      return null;
    }

    return (
      <SVGLayer>
        <VisualisationElementList vis={vis} />
      </SVGLayer>
    );
  }
}

export default SVGVisualisationLayer;