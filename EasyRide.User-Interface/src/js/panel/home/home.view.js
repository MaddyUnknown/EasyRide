import html from "bundle-text:../../../html/home.html";

import { SearchBoxView } from "../../components/searchBox/searchBox.view";
import { PanelViewBase } from "../../modules/viewModule";
import { HomePanelPresenter } from "./home.presenter";

class HomePanelView extends PanelViewBase {
    constructor() {
        super();
        this._presenter = new HomePanelPresenter(this);
        this._searchBox = new SearchBoxView();
    }

    static get $PANEL_TEMPLATE() {
        if(!HomePanelView._pageTemplate) {
            const template = document.createElement('template');
            const contentStr = html.trim();
            template.innerHTML = contentStr;
            HomePanelView._pageTemplate = template;
        }
        
        return HomePanelView._pageTemplate.content.cloneNode(true);
    }

    init() {
        this._searchBox.init();
        this._presenter.init();
    }

    destroy() {
        this._presenter.destroy();
        this._searchBox.destroy();
    }

    addSearchBusHandler(handler) {
        this._searchBox.addSearchHandler(handler);
    }

    removeSearchBusHandler(handler) {
        this._searchBox.removeSearchHandler(handler);
    }

}

export {HomePanelView};