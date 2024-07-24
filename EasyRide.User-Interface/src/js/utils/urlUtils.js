import {InvalidQueryParamError, InvalidQueryStringError, InvalidRouteError} from '../modules/errorModule.js';

class UrlUtils {
    static isValidPath(path, checkRoot = false) {
        const rootExp = /^\//;
        const genericPath = /^(\/|\.\/|(\.\.\/)+)((([a-zA-Z0-9\-_~]|(%[0-9a-fA-F]{2}))+(\/)?)*)$/;
        
        if(checkRoot && !rootExp.test(path)) {
            return false;
        }

        return genericPath.test(path);
    }

    static isValidQueryString(queryString) {
        const genericQuery = /^$|^\?((([a-zA-Z0-9\-_~]|(%[0-9a-fA-F]{2}))+)=(([a-zA-Z0-9\-_~]|(%[0-9a-fA-F]{2}))+))(&(([a-zA-Z0-9\-_~]|(%[0-9a-fA-F]{2}))+)=(([a-zA-Z0-9\-_~]|(%[0-9a-fA-F]{2}))+))*$/;
        return genericQuery.test(queryString);
    }

    static isValidQueryParamMap(queryMap, error = {keys: [], values: []}) {
        const regex = /^([a-zA-Z0-9\-_~]|(%[0-9a-fA-F]{2}))+$/;

        const invalidKey = Object.keys(queryMap).reduce((acc, key) => {
            if(!regex.test(encodeURI(key))) {
                acc.push(`'${key}'`);
            }

            return acc;
        }, []);

        const invalidValue = Object.values(queryMap).reduce((acc, value) => {
            if(!regex.test(encodeURI(value))) {
                acc.push(`'${value}'`);
            }
            
            return acc;
        }, []);

        error.keys = invalidKey;
        error.values = invalidValue;

        if(invalidKey.length !== 0 || invalidValue.length !== 0) {
            return false;
        } else {
            return true;
        }
    }

    static createPathSegmentListFromPath(path) {
        if(!this.isValidPath(path)) {
            throw new InvalidRouteError(path);
        }
        const segmentList = [];

        const normalisedRouteStr = path.replace(/^\/|\/$/g, '');

        if(normalisedRouteStr.length > 0) {
            segmentList.push(...normalisedRouteStr.split('/'));
        }

        return segmentList;
    }

    static createPathFromPathSegmentList(pathSegmentList) {
        const path = pathSegmentList.join('/');
        if(path.length === 0) {
            return '/';
        }
        else if(path.at(0) === '.') {
            return path;
        }
        else {
            return `/${path}`;
        }
    }

    static createNewPathSegmentList(currentPathSegmentList, relativePathSegmentList) {
        // relative path itself is the root path
        if(relativePathSegmentList.at(0) !== '.' && relativePathSegmentList.at(0) !== '..') {
            return relativePathSegmentList;
        }

        const newPathSegmentList = [...currentPathSegmentList];
        
        for(const segment of relativePathSegmentList) {
            if(segment === '.') {
                continue;
            }
            else if(segment === '..') {
                if(newPathSegmentList.length === 0) {
                    const currentPathString = this.createPathStringFromPathSegmentList(relativePathSegmentList);
                    const relativePathString = this.createPathSegmentListFromPathString(currentPathSegmentList);
                    throw new InvalidRouteError(relativePathString);
                }
                
                newPathSegmentList.pop();
            }
            else {
                newPathSegmentList.push(segment);
            }
        }

        return newPathSegmentList;

    }

    static createQueryMapFromQueryString(queryString) {
        if(!this.isValidQueryString(queryString)) {
            throw new InvalidQueryStringError(queryString);
        }

        if(queryString === '') {
            return {};
        }

        const queryParamMap = queryString.slice(1).split('&').reduce((acc, pairStr) =>{
            const [key, value] = pairStr.split('=');
             acc[decodeURI(key)]  = decodeURI(value);
             return acc;
        }, {});

        return queryParamMap;
    }

    static createQueryStringFromQueryMap(queryMap) {
        const errorObj = {keys: [], values: []};
        if(!this.isValidQueryParamMap(queryMap, errorObj)) {
            // throw new type of error;
            throw new InvalidQueryParamErrorError(errorObj);
        }

        const queryParams = Object.entries(queryMap).map(([key, value]) => {
            return `${encodeURI(key)}=${encodeURI(value)}`;
        }).join('&');

        if(queryParams.length === 0) {
            return '';
        } else {
            return `?${queryParams}`;
        }
    }
}

export {UrlUtils};