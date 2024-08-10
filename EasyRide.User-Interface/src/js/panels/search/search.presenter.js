import { SearchPanelView } from "./search.view";
import { router } from "../../modules/routeModule";
import { FetchUtils } from "../../utils/fetchUtils";
import { messageInfoComponent } from "../../modules/viewModule";

class SearchPanelPresenter {

    constructor(view) {
        if(!(view instanceof SearchPanelView)) {
            throw new InvalidArgumentError('view', view);
        }
        this._view = view;
    }

    init() {
        this._boundSearchBusHandler = this.searchBusHandler.bind(this);
        this._boundSeatSelectedHandler = this.seatSelectedHandler.bind(this);
        this._boundSeatViewHandler = this.seatViewHandler.bind(this);

        this._view.searchBox.addEventHandler('validated-search', this._boundSearchBusHandler);
        this._view.busSeatConfig.addEventHandler('seat-selected', this._boundSeatSelectedHandler);
        this._view.addEventHandler('seat-view', this._boundSeatViewHandler);

        this.initSearchResult();
    }

    destroy() {
        this._view.searchBox.removeEventHandler('validated-search', this._boundSearchBusHandler);
        this._view.busSeatConfig.removeEventHandler('seat-selected', this._boundSeatSelectedHandler);
        this._view.addEventHandler('seat-view', this._boundSeatViewHandler);

        this._boundSearchBusHandler = this._boundSeatSelectedHandler = this._boundSeatViewHandler = undefined;
    }

    searchBusHandler(searchData) {
        const {boardingPoint, droppingPoint, boardingDate} = searchData;
        router.navigateToRoute('/search', {
            queryParams : {
                boardingPoint,
                droppingPoint,
                boardingDate
            }
        });
    }

    seatSelectedHandler(seatSelectedData) {
        console.log(seatSelectedData);
    }

    seatViewHandler(eventData) {
        console.log(eventData);
    }

    async initSearchResult() {
        const { boardingPoint, droppingPoint, boardingDate } = router.queryParams;
        
        if(!boardingPoint || !droppingPoint || !boardingDate) {
            return;
        }
        
        try {
            this._view.searchBox.searchData = { boardingPoint, droppingPoint, boardingDate };
            this._view.addLoadingAnimationToSearchResult();
            const data  = await FetchUtils.fetchListOfBusDetails(boardingPoint, droppingPoint, boardingDate);
            this._view.setSearchResultData(data);
            this._view.removeLoadingAnimationFromSearchResult();
        } catch(ex) {
            console.error(ex);
            messageInfoComponent.addErrorMessage('Error while getting bus details');
        }

        this._view.removeLoadingAnimationFromSearchResult();
    }
}

export { SearchPanelPresenter };