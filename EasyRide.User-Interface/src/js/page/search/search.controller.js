import html from "bundle-text:../../../html/search.html";
import { PageControllerBase } from "../../modules/viewModule";
import { SearchPageView } from "./search.view";

class SearchPageController extends PageControllerBase {
    static $PAGE_TEMPLATE = html;

    constructor() {
        this._searchPageView = new SearchPageView();
    }

    init() {

    }

    destroy() {
        
    }
}

export { SearchPageController };