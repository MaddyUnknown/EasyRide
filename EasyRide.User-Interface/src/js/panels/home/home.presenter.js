
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
        this._boundSearchBusHandler = this.searchBusHandler.bind(this);
        this._view.searchBox.addEventHandler('validated-search', this._boundSearchBusHandler);
    }

    destroy() {
        this._view.searchBox.removeEventHandler('validated-search', this._boundSearchBusHandler);
        this._boundSearchBusHandler = undefined;
    }

    searchBusHandler(eventData) {
        const {boardingPoint, droppingPoint, boardingDate} = eventData;
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