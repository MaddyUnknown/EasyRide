import { SearchPanelView } from "./search.view";
import { router } from "../../modules/routeModule";
import { FetchUtils } from "../../utils/fetchUtils";

class SearchPanelPresenter {

    constructor(view) {
        if(!(view instanceof SearchPanelView)) {
            throw new InvalidArgumentError('view', view);
        }
        this._view = view;
    }

    init() {
        this._view.addSearchBusHandler(this.searchBusHandler.bind(this));
        this.initSearchResult();
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

    async initSearchResult() {
        const { boardingPoint, droppingPoint, boardingDate } = router.queryParams;
        this._view.searchData = { boardingPoint, droppingPoint, boardingDate };

        this._view.addLoadingAnimationToSearchResult();
        const data  = await FetchUtils.fetchListOfBusDetails(boardingPoint, droppingPoint, boardingDate);
        this._view.setSearchResultData(data);
        this._view.removeLoadingAnimationFromSearchResult();
    }
}

export { SearchPanelPresenter };