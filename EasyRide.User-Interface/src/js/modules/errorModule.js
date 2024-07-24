class ApplicationError extends Error {
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
    }
}

class RouteError extends ApplicationError {
    constructor(message, route) {
        super(message);
        this.route = route;
        Error.captureStackTrace(this, this.constructor);
    }
}

class RouteNotFoundError extends RouteError {
    constructor(route) {
        super(`Route '${route}' not found.`, route);
        Error.captureStackTrace(this, this.constructor);
    }
}

class RouteExistsError extends RouteError {
    constructor(route) {
        super(`Route '${route}' already exists.`, route);
        Error.captureStackTrace(this, this.constructor);
    }
}

class InvalidRouteError extends RouteError {
    constructor(route, isRoot = false) {
        super(`Invalid ${isRoot?'root ':''}route: '${route}'.`, route);
        Error.captureStackTrace(this, this.constructor);
    }
}

class QueryParamError extends ApplicationError {
    constructor(message, queryParams) {
        super(message);
        this.queryParam = queryParams;
        Error.captureStackTrace(this, this.constructor);
    }
}

class InvalidQueryParamError extends QueryParamError {
    constructor(invalidKeysAndValues) {
        super(`Invalid query parameters:- ${invalidKeysAndValues.keys.length === 0?'':`Key: ${invalidKeysAndValues.keys.join(',')}`}${(invalidKeysAndValues.keys.length !== 0 && invalidKeysAndValues.values.length !== 0)?', ':''}${invalidKeysAndValues.values.length === 0?'':`Value: ${invalidKeysAndValues.values.join(',')}`}`, invalidKeysAndValues);
        Error.captureStackTrace(this, this.constructor);
    }
}

class QueryStringError extends ApplicationError {
    constructor(message, queryString) {
        super(message);
        this.queryString = queryString;
        Error.captureStackTrace(this, this.constructor);
    }
}

class InvalidQueryStringError extends QueryStringError {
    constructor(queryString) {
        super(`Invalid query string: '${queryString}'`, queryString);
        Error.captureStackTrace(this, this.constructor);
    }
}

export {ApplicationError, RouteError, QueryParamError, QueryStringError, RouteNotFoundError, InvalidRouteError, RouteExistsError, InvalidQueryParamError, InvalidQueryStringError};