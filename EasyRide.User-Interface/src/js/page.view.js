import { PageHeaderView } from "./components/pageHeader/pageHeader.view";
import { router } from "./modules/routeModule";
import { PageViewBase } from "./modules/viewModule";
import { MainPagePresenter } from "./page.presenter";

class MainPageView extends PageViewBase {
    constructor() {
        super();
        this._presenter = new MainPagePresenter(this);
        this.header = new PageHeaderView();
    }

    init() {
        this._container = document.querySelector('app-container');
        this.header.init();
        this._presenter.init();

        this._presenter.routeChangeHander(router.currentRouteData);
    }

    destroy() {
        this._presenter.destroy();
        
        this.header.destroy();
        this._container = undefined;
    }

    addRouteChangeHandler(handler) {
        router.addRouteChangeHandler(handler);
    }

    removeRouteChangeHandler(handler) {
        router.removeRouteChangeHandler(handler);
    }

    setPanelContent(content) {
        this._container.innerHTML = '';
        this._container.appendChild(content);
    }
}

export { MainPageView };