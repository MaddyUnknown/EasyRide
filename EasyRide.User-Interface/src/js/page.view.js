import { router } from "./modules/routeModule";
import { ViewBase } from "./modules/viewModule";
import { MainPagePresenter } from "./page.presenter";

class MainPageView extends ViewBase {
    constructor() {
        super();
        this._presenter = new MainPagePresenter(this);
    }

    init() {
        this._container = document.querySelector('app-container');
        this._presenter.init();

        this._presenter.routeChangeHander(router.currentRouteData);
    }

    destroy() {
        this._presenter.destroy();
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