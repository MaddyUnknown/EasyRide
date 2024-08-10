import { InvalidArgumentError } from "../../modules/errorModule";
import { BusSeatConfigView } from "./busSeatConfig.view";

class BusSeatConfigPresenter {
    constructor(view) {
        if(!(view instanceof BusSeatConfigView)) {
            throw new InvalidArgumentError('view', view);
        }
        
        this._view = view;
    }

    init() {
        
    }

    destroy() {

    }
}

export { BusSeatConfigPresenter };