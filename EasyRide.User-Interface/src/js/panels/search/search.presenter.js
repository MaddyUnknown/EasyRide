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
        this._boundHideViewHandler = this.hideViewHandler.bind(this);

        this._view.searchBox.addEventHandler('validated-search', this._boundSearchBusHandler);
        this._view.busSeatConfig.addEventHandler('seat-selected', this._boundSeatSelectedHandler);
        this._view.addEventHandler('seat-view', this._boundSeatViewHandler);
        this._view.addEventHandler('close-seat-view', this._boundHideViewHandler);

        this.initSearchResult();
    }

    destroy() {
        this._view.searchBox.removeEventHandler('validated-search', this._boundSearchBusHandler);
        this._view.busSeatConfig.removeEventHandler('seat-selected', this._boundSeatSelectedHandler);
        this._view.removeEventHandler('seat-view', this._boundSeatViewHandler);
        this._view.removeEventHandler('close-seat-view', this._boundHideViewHandler);

        this._boundSearchBusHandler = this._boundSeatSelectedHandler = this._boundSeatViewHandler = this._boundHideViewHandler = undefined;
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

    async seatViewHandler(seatViewData) {
        const stopAnimation = this._view.busSeatConfig.addLoadingAnimation({ container : 'seat-config' });
        
        try {
            this._view.showSeatConfigScreen();
            const seatConfig = await FetchUtils.fetchBusSeatConfigDetails(seatViewData.busIndex);
            this._view.busSeatConfig.setSeatConfig(seatConfig);
        } catch(ex) {
            console.error(ex);
            messageInfoComponent.addErrorMessage('Error while getting bus seat details');
        }

        stopAnimation();
    }

    hideViewHandler() {
        this._view.hideSeatConfigScreen();
    }

    async initSearchResult() {
        const { boardingPoint, droppingPoint, boardingDate } = router.queryParams;
        
        if(!boardingPoint || !droppingPoint || !boardingDate) {
            return;
        }
        
        const stopAnimation = this._view.addLoadingAnimation({ container : 'search-result' });
        
        try {
            this._view.searchBox.searchData = { boardingPoint, droppingPoint, boardingDate };
            const data  = await FetchUtils.fetchListOfBusDetails(boardingPoint, droppingPoint, boardingDate);
            this._view.setSearchResultData(data);
        } catch(ex) {
            console.error(ex);
            messageInfoComponent.addErrorMessage('Error while getting bus details');
        }

        stopAnimation();
    }
}

export { SearchPanelPresenter };