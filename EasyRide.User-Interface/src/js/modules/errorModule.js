class RouteNotFoundError extends Error {
    constructor(message, routeName) {
        super(message);
        this.routeName = routeName;
        Error.captureStackTrace(this, this.constructor);
    }
}

class RouteExistsError extends Error {
    constructor(message, route) {
        super(message);
        this.route = route;
        Error.captureStackTrace(this, this.constructor);
    }
}

class InvalidRouteError extends Error {
    constructor(message, route) {
        super(message);
        this.route = route;
        Error.captureStackTrace(this, this.constructor);
    }
}

export {RouteNotFoundError, InvalidRouteError, RouteExistsError};