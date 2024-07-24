import { UrlUtils } from "./urlUtils";

class HistoryUtils {
    static addNewState(state) {
        let queryString = UrlUtils.createQueryStringFromQueryMap(state.queryParams??{});
        history.pushState(state, '', state.path+queryString);
    }
    
    static updateCurrentState(state) {
        let queryString = UrlUtils.createQueryStringFromQueryMap(state.queryParams??{});
        history.replaceState(state, '', state.path+queryString);
    }
}

export { HistoryUtils };