import { SearchPanelView } from "./search.view";
import { router } from "../../modules/routeModule";

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

    //Work under process
    async initSearchResult() {
        const { boardingPoint, droppingPoint, boardingDate } = this._view.searchData;
        const data  = await this._getDataForSearchParam();
        this._view.setSearchResultData(data);
    }

    //Work in process
    async _getDataForSearchParam() {
        const data = []
        for(let i=1; i<=20; i++) {
            data.push({id : i, busName : 'Green View', seatConfigName : 'Volvo 9090 2+1 (seater+sleeper)', totalReviews: 4500});
        }
        return data;
    }
}

export { SearchPanelPresenter };