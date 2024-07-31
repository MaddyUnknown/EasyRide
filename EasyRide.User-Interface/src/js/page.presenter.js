import { ViewType } from './modules/viewModule';
import { InvalidArgumentError } from './modules/errorModule';
import { MainPageView } from './page.view';


class MainPagePresenter {
    constructor(view) {
        if(!(view instanceof MainPageView)) {
            throw new InvalidArgumentError('view', view);
        }

        this._view = view;
        this._activePanel = null;
    }

    init() {
        this._view.addRouteChangeHandler(this.routeChangeHander.bind(this));
    }

    destroy() {
        this._view.removeRouteChangeHandler(this.routeChangeHander.bind(this));
    }


    routeChangeHander(routeChangeEvent) {
        const { routePanelView } = routeChangeEvent;

        if(routePanelView.$TYPE !== ViewType.PANEL) {
            throw new Error(`'RoutePanelView' is not of type 'PanelViewBase'`);
        } 

        const content = routePanelView.$PANEL_TEMPLATE;

        if(content === null) {
            throw new Error(`'RoutePanelView' has not template attached`);
        }

        if(this._activePanel !== null) {
            this._activePanel.destroy();
        }

        this._view.setPanelContent(content);
        
        const panel = new routePanelView();
        panel.init();
        this._activePanel = panel;
    }
}

export { MainPagePresenter }