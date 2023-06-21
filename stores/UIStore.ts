import {action, observable} from 'mobx';

export enum VIEW {
    GEOGRAPHIC,
    DURATION,
    FREQUENCY,
    TRAJECTORIES
}

class UIStore {
    @observable
    timeSpan?: ReadonlyArray<number>;

    @observable
    view?: VIEW;

    @observable
    withFriend: boolean = true;

    @action
    update({view, timeSpan, withFriend}: { timeSpan?: ReadonlyArray<number>; view?: VIEW; withFriend?: boolean }) {
        this.view = view;
        this.timeSpan = timeSpan;
        if (withFriend !== undefined) this.withFriend = withFriend;
    }
}

export default UIStore;
