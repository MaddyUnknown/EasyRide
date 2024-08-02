
import { HomePanelView } from "./home.view";
import { router } from "../../modules/routeModule";

class HomePanelPresenter {

    constructor(view) {
        if(!(view instanceof HomePanelView)) {
            throw new InvalidArgumentError('view', view);
        }
        this._view = view;
    }

    init() {
        this._view.addSearchBusHandler(this.searchBusHandler.bind(this));
    }

    destroy() {
        this._view.removeSearchBusHandler(this.searchBusHandler.bind(this));
    }

    searchBusHandler(eventData) {
        const {boardingPoint, droppingPoint, boardingDate} = eventData.detail;
        router.navigateToRoute('/search', {
            queryParams : {
                boardingPoint,
                droppingPoint,
                boardingDate
            }
        });
    }
}

export { HomePanelPresenter };