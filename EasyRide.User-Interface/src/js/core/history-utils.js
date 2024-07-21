import {getStringFromRoute} from './url-utils.js';

const addNewHistory = function(routeState) {
    const url = getStringFromRoute(routeState);
    history.pushState(routeState, '', url);
    window.dispatchEvent(new PopStateEvent('popstate', {state: routeState}));
}

const updateCurrentHistory = function(routeState) {
    const url = getStringFromRoute(routeState);
    history.replaceState(routeState, '', url);
}

export {addNewHistory, updateCurrentHistory};