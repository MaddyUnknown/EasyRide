import {addNewHistory, updateCurrentHistory} from './history-utils.js';
import {getRouteFromString} from './url-utils.js';
import {viewAccessor} from './view.js';

class ViewRouterBuilder {
    constructor() {
        this._routeMap = {}
        this._rootContainerSelector = 'app-container';
    }

    registerRoute(routePath, viewPath, componentClass) {
        if(rootRoute) {
            throw new Error(`Can not add routes as view router already created`);
        }
        else if(this._routeMap[routePath]) {
            throw new Error(`Route '${routePath}' is already registered`);
        }

        this._routeMap[routePath] = {routePath, viewPath, componentClass};
    }

    addRootContainerSelector(rootSelector) {
        if(!rootRoute) {
            throw new Error(`Can not add routes as view router already created`);
        }

        this._rootContainerSelector = rootSelector;
    }

    build() {
        if(rootRoute) {
            throw new Error(`View router already created`);
        }
        rootRoute = new ViewRouter(this._rootContainerSelector, this._routeMap);
    }
}


class ViewRouter {
    constructor(rootSelector, routeMap) {
        this._routeMap = routeMap;
        this._rootSelector = document.querySelector(rootSelector);

        if(!this._rootSelector) {
            throw new Error(`Root selector '${rootSelector}' not found in DOM, route failed to initiate`);
        }

        this._initCurrentPath();
        this._initRouteChangeListner();
        this._initRouteLinkClickListner();
    }

    getQueryParameters() {
        return Object.assign({}, this._currentRoute['queryParams']);
    }

    navigateToRoute(path, queryParams = {}) {
        const routeViewState = {path, queryParams};
        this._currentRoute = routeViewState;
        addNewHistory(routeViewState);
    }

    _initCurrentPath() {
        const routeString = (window.location.pathname??'') + (window.location.search??'');
        this._currentRoute = getRouteFromString(routeString);
        updateCurrentHistory(this._currentRoute);
        this._renderRouteView(this._currentRoute);
    }

    _initRouteLinkClickListner() {
        document.addEventListener('click', function(e) {
            const routeString = e.target.closest('[route-link]')?.getAttribute('route-link');
            if(routeString) {
                e.preventDefault();
                const route = getRouteFromString(routeString);
                this.navigateToRoute(route.path, route.queryParams);
            }
        }.bind(this));
    }

    _initRouteChangeListner() {
        window.addEventListener('popstate', function(e) {
            this._renderRouteView(e.state);
        }.bind(this));
    }
    
    _renderRouteView(state) {
        console.log("State: ", state);
        const routeProperty = this._routeMap[state.path];
        viewAccessor.renderViewForComponentClass(routeProperty.componentClass, state, this._rootSelector);
    }
}

class ViewRouterAccessor {
    get ViewRouter() {
        if(!rootRoute) {
            throw new Error(`View router not created`);
        }

        return rootRoute;
    }
}


/******************* INITIALIZATIONS ****************************/
let rootRoute;
const viewRouterBuilder = new ViewRouterBuilder();
const viewRouterAccessor = new ViewRouterAccessor();


export {viewRouterBuilder, viewRouterAccessor};