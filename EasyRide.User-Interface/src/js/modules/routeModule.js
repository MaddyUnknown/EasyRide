import { UrlUtils } from '../utils/urlUtils.js';
import { InvalidRouteError, RouteExistsError, RouteNotFoundError } from './errorModule.js';
import { pagePanelController } from '../panel/pagePanel/pagePanel.controller.js';

class RouterBuilder {
    constructor() {
        this._routeMap = new RouteMap();
        this._routeDOMContainer = 'app-container';
    }

    set $ROUTER_CONTAINER_SELECTOR(value) {
        this._initializationValidation();
        this._routeDOMContainer = value;
    }

    registerRoute(path, componentClass, { isDefault=false, isErrorRoute=false } = {}) {
        this._initializationValidation();

        if(!UrlUtils.isValidPath(path, true)) {
            throw new InvalidRouteError(`'${path}' is not a valid root path`);
        }
        else if(this._routeMap.has(path)) {
            throw new Error(`Route '${path}' already registered`);
        }

        const pathSegmentList = UrlUtils.createPathSegmentListFromPath(path);
        this._routeMap.set(pathSegmentList, componentClass, {isDefault, isErrorRoute});
    }

    build() {
        this._initializationValidation();

        const routerContainer = document.querySelector(this._routeDOMContainer);
        if(!routerContainer) {
            throw new Error(`Router build failed: Selector '${this._routeDOMContainer}' not found in DOM`);
        }

        router = new Router(routerContainer, this._routeMap);
        isRouterInitialized = true;
        router.init();
    }

    _initializationValidation() {
        if(isRouterInitialized) {
            throw new Error(`Cannot modify 'RouteBuilder': Router already initialized`);
        }
    }
}


class Router {
    constructor(routeContainer, routeMap) {
        this._routeMap = routeMap;
        this._routeDOMContainer = routeContainer;
        this._currentRoute = null;
    }

    init() {
        this._initRoute();
        this._initRouteChangeListner();
    }

    navigateToRoute(path) {
        try {
            const pathSegmentList = UrlUtils.createPathSegmentListFromPath(path);
            const newPathSegmentList = UrlUtils.createNewPathSegmentList(this._currentRoute.path, pathSegmentList);
            this._currentRoute = this._routeMap.get(newPathSegmentList);
        }
        catch {
            console.error(`Route not found for path: ${path}, routing to error route`);
            this._currentRoute = this._routeMap.getErrorRoute();
        }

        pagePanelController.setComponent(this._currentRoute.componentClass);
    }

    get $ROUTER_CONTAINER() {
        return this._routeDOMContainer;
    }

    _initRoute() {
        const path = window.location.pathname;
        
        try {
            const pathSegmentList = UrlUtils.createPathSegmentListFromPath(path);
            this._currentRoute = this._routeMap.get(pathSegmentList);
        }
        catch(error) {
            console.error(`Route not found for path: '${path}', routing to default route`);
            
            try {
                this._currentRoute = this._routeMap.getDefaultRoute();
            }
            catch(error2) {
                console.error(`Defaut route not found, routing to error route`);
                this._currentRoute = this._routeMap.getErrorRoute();
            }
        }
        
        pagePanelController.setComponent(this._currentRoute.componentClass);
    }

    _initRouteChangeListner() {
        window.addEventListener('popstate', (e) => {
            ({ path } = e.state)
            const pathSegmentList = UrlUtils.createPathSegmentListFromPath(path);
            this._currentRoute = this._routeMap.get(pathSegmentList);
            pagePanelController.setComponent(this._currentRoute.componentClass);
        });
    }
}


class RouteMap {
    constructor() {
        this._root = { segment: '', routeData: null, children: []};
        this._defaultRoute = null;
        this._errorRoute = null;
    }

    set(pathSegmentList, componentClass, {isDefault=false, isErrorRoute=false} = {}) {
        if(isDefault && this._defaultRoute !== null) {
            throw new RouteExistsError(`Default route already registered`, 'default');
        } else if(isErrorRoute && this._errorRoute !== null) {
            throw new RouteExistsError(`Error route already registered`, 'error');
        }

        let currentPointer = this._root;
        for(const segment of pathSegmentList) {
            const matchingChild = currentPointer.children.find(x=> x.segment === segment); // try binary search
            if(matchingChild) {
                currentPointer = matchingChild;
            } else {
                const newChild = {segment : segment, routeData : null, children : []};
                currentPointer.children.push(newChild); // try sorted insert
                currentPointer = newChild;
            }
        }

        const pathString = UrlUtils.createPathFromPathSegmentList(pathSegmentList);
        if(currentPointer.routeData === null) {
            currentPointer.routeData = { path: pathString, componentClass};
            if(isDefault) {
                this._defaultRoute = currentPointer.routeData;
            }
            if(isErrorRoute) {
                this._errorRoute = currentPointer.routeData;
            }
        } else {
            throw new RouteExistsError(`Route for path: '${pathString}' already registered`, pathString);
        }
    }

    get(pathSegmentList) {
        const pathString = UrlUtils.createPathFromPathSegmentList(pathSegmentList);
        let currentPointer = this._root;
        for(const segment of pathSegmentList) {
            currentPointer = currentPointer.children.find(x=> x.segment === segment); // try binary search
            if(!currentPointer) {
                throw new RouteNotFoundError(`Route not found for path: ${pathString}`, pathString);
            }
        }

        if(currentPointer.routeData === null) {
            throw new RouteNotFoundError(`Route not found for path: ${pathString}`, pathString);
        } else {
            return currentPointer.routeData;
        }
    }

    has(pathSegmentList) {
        let currentPointer = this._root;
        for(const segment of pathSegmentList) {
            currentPointer = currentPointer.children.find(x=> x.segment === segment); // try binary search
            if(!currentPointer) {
                return false;
            }
        }

        if(currentPointer.routeData === null) {
            return false;
        } else {
            return true;
        }
    }

    getDefaultRoute() {
        if(this._defaultRoute === null) {
            throw new RouteNotFoundError(`Default route not found`, 'default');
        }

        return this._defaultRoute;
    }

    getErrorRoute() {
        if(this._errorRoute === null) {
            throw new RouteNotFoundError(`Error route not found`, 'error');
        }

        return this._errorRoute;
    }

}


/******************* INITIALIZATIONS ****************************/
let isRouterInitialized = false;
let router = null;

const routerBuilder = new RouterBuilder();


export {routerBuilder, router};