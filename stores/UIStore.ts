import {action, observable} from 'mobx';
import ToggleContext from "../components/Visualisation/FilterToolbar/ToggleContext";

export enum VIEW {
    GEOGRAPHIC,
    DURATION,
    FREQUENCY,
    TRAJECTORIES
}

class UIStore {
    static toggleContext = ToggleContext;

    @observable
    timeSpan?: ReadonlyArray<number>;

    @observable
    view?: VIEW;

    @observable
    withFriend: boolean = false;

    @action
    update({view, timeSpan}: { timeSpan?: ReadonlyArray<number>; view?: VIEW }) {
        this.view = view;
        this.timeSpan = timeSpan;
    }

    @action
    updateWithFriend(withFriend: boolean) {
        this.withFriend = withFriend;
    }
}

export default UIStore;
