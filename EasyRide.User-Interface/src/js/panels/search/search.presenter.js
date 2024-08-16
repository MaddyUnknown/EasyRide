import { SearchPanelView } from "./search.view";
import { router } from "../../modules/routeModule";
import { FetchUtils } from "../../utils/fetchUtils";
import { messageInfoComponent } from "../../modules/viewModule";
import { isNullOrUndefined } from "../../utils/commonUtils";

class SearchPanelPresenter {

    constructor(view) {
        if(!(view instanceof SearchPanelView)) {
            throw new InvalidArgumentError('view', view);
        }
        this._view = view;
        this._state = {};
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
        const { data: {seatId, price, gst}, state: {isSelected}} = seatSelectedData;

        if(isSelected) {
            this._state.selectedSeatData.netCost += price??0;
            this._state.selectedSeatData.gst += gst??0;
            this._state.selectedSeatData.total += (price??0)+(gst??0);
            if(seatId) {
                this._state.selectedSeatData.seatsSelected.add(seatId);
            }
        } else {
            this._state.selectedSeatData.netCost -= price??0;
            this._state.selectedSeatData.gst -= gst??0;
            this._state.selectedSeatData.total -= (price??0)+(gst??0);

            if(seatId) {
                this._state.selectedSeatData.seatsSelected.delete(seatId);
            }
        }

        this._view.setSeatSelectionDetails({
            seatsSelected: this._state.selectedSeatData.seatsSelected,
            netTotal: this._state.selectedSeatData.netCost,
            gst: this._state.selectedSeatData.gst,
            total: this._state.selectedSeatData.total
        })
    }

    async seatViewHandler(seatViewData) {
        const stopAnimation = this._view.addLoadingAnimation({ container : 'seat-selection-body' });
        
        try {
            this._view.showSeatConfigScreen();
            const seatConfig = await FetchUtils.fetchBusSeatConfigDetails(seatViewData.busIndex);

            this._state.selectedSeatData = {
                netCost: 0,
                gst: 0,
                total: 0,
                seatsSelected: new Set()
            };

            this._view.setSeatConfigErrorMessage({message: ''});
            this._view.setSeatSelectionDetails({
                sourceStop: this._state.searchData.boardingPoint,
                destStop: this._state.searchData.droppingPoint,
                seatsSelected: this._state.selectedSeatData.seatsSelected,
                netTotal: this._state.selectedSeatData.netCost,
                gst: this._state.selectedSeatData.gst,
                total: this._state.selectedSeatData.total
            });
            this._view.busSeatConfig.setSeatConfig(seatConfig);
        } catch(ex) {
            console.error(ex);
            messageInfoComponent.addErrorMessage('Error while getting bus seat details');
            this._view.setSeatConfigErrorMessage({message: 'We are having trouble fetching bus seat details. Please try again later!'});
        }

        stopAnimation();
    }

    hideViewHandler() {
        this._view.hideSeatConfigScreen();
        this._state.selectedSeatData = {};
    }

    async initSearchResult() {
        const { boardingPoint, droppingPoint, boardingDate } = router.queryParams;
        
        if(!boardingPoint || !droppingPoint || !boardingDate) {
            return;
        }
        
        const stopAnimation = this._view.addLoadingAnimation({ container : 'search-result' });
        
        try {
            this._view.searchBox.searchData = { boardingPoint, droppingPoint, boardingDate };
            this._state.searchData = {boardingPoint, droppingPoint, boardingDate};
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