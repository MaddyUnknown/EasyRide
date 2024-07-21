import html from "bundle-text:../../../html/home.html";
import { PageControllerBase } from "../../modules/viewModule";
import { HomePageView } from "./home.view";

class HomePageController extends PageControllerBase {
    static $VIEW_TEMPLATE = html;

    constructor() {
        this._homePageView = new HomePageView();
    }

    init() {

    }

    destroy() {

    }
}

export { HomePageController };