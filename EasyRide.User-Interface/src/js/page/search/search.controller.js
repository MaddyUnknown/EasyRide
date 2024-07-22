import html from "bundle-text:../../../html/search.html";
import { PageControllerBase } from "../../modules/viewModule";
import { SearchPageView } from "./search.view";

class SearchPageController extends PageControllerBase {
    static $PAGE_TEMPLATE = html;

    constructor() {
        super();
        this._searchPageView = new SearchPageView();
    }

    init() {
        this._searchPageView.addFilterSectionResizeHandler();
        this._searchPageView.addSearchBusEventHandler(this.searchBusHanlder.bind(this));

        this._searchPageView.setSearchResultData(this._getDataForSearchParam());
    }

    destroy() {
        this._searchPageView.removeFilterSectionResizeHandler();
        this._searchPageView.removeAllSearchBusEventHandler();
    }

    searchBusHanlder() {
        const boardingPoint = this._searchPageView.boardingPoint;
        const droppingPoint = this._searchPageView.droppingPoint;
        const boardingDate = this._searchPageView.boardingDate;

        console.log('Search: ', boardingPoint, droppingPoint, boardingDate);

        router.navigateToRoute('/search');
    }

    _getDataForSearchParam() {
        const data = []
        for(let i=1; i<=20; i++) {
            data.push({id : i, busName : 'Green View', seatConfigName : 'Volvo 9090 2+1 (seater+sleeper)', totalReviews: 4500});
        }
        return data;
    }
}

export { SearchPageController };