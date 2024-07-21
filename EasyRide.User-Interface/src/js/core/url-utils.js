const getRouteFromString = function(routeStr) {
    let [path, queryString] = routeStr.split('?');

    const queryParams = {};
    if (queryString) {
        queryString.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            queryParams[decodeURI(key)] = decodeURI(value);
        });
    }

    return {path, queryParams};
}

const getStringFromRoute = function({path='/', queryParams={}}) {

    const queryString = Object.entries(queryParams).map(([key, value]) => {
        return `${encodeURI(key)}=${encodeURI(value)}`;
    }).join('&');

    return `${path}${queryString.length>0?'?':''}${queryString}`;
}

export {getRouteFromString, getStringFromRoute}