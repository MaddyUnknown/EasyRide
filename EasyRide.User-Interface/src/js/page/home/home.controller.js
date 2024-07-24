import html from "bundle-text:../../../html/home.html";
import { PageControllerBase, messageInfoComponent } from "../../modules/viewModule";
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
        this._homePageView.addToggleSourceDestinationHandler();
    }

    destroy() {
        this._homePageView.removeAllSearchBusEventHandler();
        this._homePageView.removeToggleSourceDestinationHandler();
    }

    searchBusHanlder() {
        const boardingPoint = this._homePageView.boardingPoint;
        const droppingPoint = this._homePageView.droppingPoint;
        const boardingDate = this._homePageView.boardingDate;

        const errorList = [];

        if(this._validateSearchInput(boardingPoint, droppingPoint, boardingDate, errorList)) {
            router.navigateToRoute('/search', {
                queryParams : {
                    boardingPoint,
                    droppingPoint,
                    boardingDate,
                }
            });
        } else {
            messageInfoComponent.addErrorMessageList(errorList);
            console.log(errorList.join('\n'));
        }
    }

    _validateSearchInput(boardingPoint, droppingPoint, boardingDate, errorList) {

        if(boardingPoint === '') {
            errorList.push(`Boarding Point cannot be empty`);
        }

        if(droppingPoint === '') {
            errorList.push(`Dropping Point cannot be empty`);
        }

        if(boardingDate === '') {
            errorList.push(`Boarding Date cannot be empty`);
        }

        if(errorList.length > 0) {
            //thow message here;
            return false;
        } else {
            return true;
        }

    }
}

export { HomePageController };