import html from "bundle-text:../../../html/home.html";
import { PageControllerBase } from "../../modules/viewModule";
import { HomePageView } from "./home.view";
import { router } from "../../modules/routeModule";

class HomePageController extends PageControllerBase {
    static $PAGE_TEMPLATE = html;

    constructor() {
        super();
        this._homePageView = new HomePageView();
    }

    init() {
        this._homePageView.addSearchBusEventHandler(this.searchBusHanlder.bind(this));
    }

    destroy() {
        this._homePageView.removeAllSearchBusEventHandler();
    }

    searchBusHanlder() {
        const boardingPoint = this._homePageView.boardingPoint;
        const droppingPoint = this._homePageView.droppingPoint;
        const boardingDate = this._homePageView.boardingDate;

        console.log('Home: ', boardingPoint, droppingPoint, boardingDate);

        router.navigateToRoute('/search');
    }
}

export { HomePageController };