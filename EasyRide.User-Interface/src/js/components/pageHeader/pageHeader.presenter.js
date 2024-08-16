import { InvalidArgumentError } from "../../modules/errorModule";
import { PageHeaderView } from "./pageHeader.view";

class PageHeaderPresenter {
    constructor(view) {
        if(!(view instanceof PageHeaderView)) {
            throw new InvalidArgumentError('view', view);
        }
        
        this._view = view;
    }

    init() {
        
    }

    destroy() {

    }
}

export { PageHeaderPresenter };