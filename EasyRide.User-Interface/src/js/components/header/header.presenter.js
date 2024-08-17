import { InvalidArgumentError } from "../../modules/errorModule";
import { HeaderView } from "./header.view";

class HeaderPresenter {
    constructor(view) {
        if(!(view instanceof HeaderView)) {
            throw new InvalidArgumentError('view', view);
        }
        
        this._view = view;
    }

    init() {
        
    }

    destroy() {

    }
}

export { HeaderPresenter };