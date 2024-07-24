import { UrlUtils } from '../utils/urlUtils';
import { HistoryUtils } from '../utils/historyUtils';
import { InvalidRouteError, RouteExistsError, RouteNotFoundError, InvalidQueryStringError, InvalidQueryParamError, ApplicationError, RouteError } from './errorModule';
import { pagePanelController } from '../panel/pagePanel/pagePanel.controller';

class RouterBuilder {
    constructor() {
        this._routeMap = new RouteMap();
    }

    registerRoute(path, pageControllerClass, { isDefault=false, isErrorRoute=false } = {}) {
        this._initializationValidation();

        if(!UrlUtils.isValidPath(path, true)) {
            throw new InvalidRouteError(path, true);
        }
        else if(this._routeMap.has(path)) {
            throw new RouteExistsError(path);
        }

        const pathSegmentList = UrlUtils.createPathSegmentListFromPath(path);
        this._routeMap.set(pathSegmentList, pageControllerClass, {isDefault, isErrorRoute});
    }

    build() {
        this._initializationValidation();

        router = new Router(this._routeMap);
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
    constructor(routeMap) {
        this._routeMap = routeMap;
        this._currentRoute = null;
        this._currentQueryParams = null;
    }

    init() {
        this._initRoute();
        this._initRouteChangeListner();
    }

    navigateToRoute(path, {queryParams = {}} = {}) {
        try {
            const pathSegmentList = UrlUtils.createPathSegmentListFromPath(path);
            const newPathSegmentList = UrlUtils.createNewPathSegmentList(this._currentRoute.path, pathSegmentList);
            this._currentRoute = this._routeMap.get(newPathSegmentList);
            
            const errorObj = {keys:[], values:[]};
            if(UrlUtils.isValidQueryParamMap(queryParams, errorObj)) {
                this._currentQueryParams = queryParams;
            } else {
                throw new InvalidQueryParamError(errorObj);
            }
        }
        catch(error) {
            if(error instanceof ApplicationError) {
                console.error(error.message);
            }
            else {
                console.error(`Error while routing to '${path}', routing to error route`);
            }
            
            this._currentRoute = this._routeMap.getErrorRoute();
            this._currentQueryParams = {};
        }

        HistoryUtils.addNewState({path: this._currentRoute.path, queryParams : this._currentQueryParams});
        pagePanelController.setPage(this._currentRoute.pageControllerClass);
    }

    get queryParams() {
        return this._currentQueryParams;
    }

    _initRoute() {
        const path = window.location.pathname;
        const queyString = window.location.search;
        
        try {
            const pathSegmentList = UrlUtils.createPathSegmentListFromPath(path);
            this._currentRoute = this._routeMap.get(pathSegmentList);
            
            const queyParams = UrlUtils.createQueryMapFromQueryString(queyString);
            this._currentQueryParams = queyParams;
        }
        catch(error) {
            if(error instanceof InvalidQueryError) {
                console.error(error.message);
                this._currentQueryParams = {};
            } else {
                
                if(error instanceof ApplicationError) {
                    console.error(error.message);
                } else {
                    console.error(`Error while routing to '${path}', routing to default route`);
                }
                
                try {
                    this._currentRoute = this._routeMap.getDefaultRoute();
                } catch(innerError) {
                    if(innerError instanceof ApplicationError) {
                        console.error(innerError.message);
                    } else {
                        console.error(`Error while routing to default path, routing to error route`);
                        this._currentRoute = this._routeMap.getErrorRoute();
                    }
                }

                this._currentQueryParams = {};
            }
        }
        
        HistoryUtils.updateCurrentState({path: this._currentRoute.path, queryParams : this._currentQueryParams});
        pagePanelController.setPage(this._currentRoute.pageControllerClass);
    }

    _initRouteChangeListner() {
        window.addEventListener('popstate', (e) => {
            const { path, queryParams } = e.state;
            const pathSegmentList = UrlUtils.createPathSegmentListFromPath(path);
            this._currentRoute = this._routeMap.get(pathSegmentList);
            this._currentQueryParams = queryParams;

            pagePanelController.setPage(this._currentRoute.pageControllerClass);
        });
    }
}


class RouteMap {
    constructor() {
        this._root = { segment: '', routeData: null, children: []};
        this._defaultRoute = null;
        this._errorRoute = null;
    }

    set(pathSegmentList, pageControllerClass, {isDefault=false, isErrorRoute=false} = {}) {
        if(isDefault && this._defaultRoute !== null) {
            throw new RouteExistsError('default');
        } else if(isErrorRoute && this._errorRoute !== null) {
            throw new RouteExistsError('error');
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
            currentPointer.routeData = { path: pathString, pageControllerClass};
            if(isDefault) {
                this._defaultRoute = currentPointer.routeData;
            }
            if(isErrorRoute) {
                this._errorRoute = currentPointer.routeData;
            }
        } else {
            throw new RouteExistsError(pathString);
        }
    }

    get(pathSegmentList) {
        const pathString = UrlUtils.createPathFromPathSegmentList(pathSegmentList);
        let currentPointer = this._root;
        for(const segment of pathSegmentList) {
            currentPointer = currentPointer.children.find(x=> x.segment === segment); // try binary search
            if(!currentPointer) {
                throw new RouteNotFoundError(pathString);
            }
        }

        if(currentPointer.routeData === null) {
            throw new RouteNotFoundError(pathString);
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
            throw new RouteNotFoundError('default');
        }

        return this._defaultRoute;
    }

    getErrorRoute() {
        if(this._errorRoute === null) {
            throw new RouteNotFoundError('error');
        }

        return this._errorRoute;
    }

}


/******************* INITIALIZATIONS ****************************/
let isRouterInitialized = false;
let router = null;

const routerBuilder = new RouterBuilder();


export {routerBuilder, router};