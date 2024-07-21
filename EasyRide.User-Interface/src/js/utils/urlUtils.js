import {InvalidRouteError} from '../modules/errorModule.js';

class UrlUtils {
    static isValidPath(path, checkRoot = false) {
        const rootExp = /^\//;
        const genericRoute = /^(\/|\.\/|(\.\.\/)+)((([a-zA-Z0-9\-_~]|(%[0-9a-fA-F]{2}))+(\/)?)*)$/;
        
        if(checkRoot && !rootExp.test(path)) {
            return false;
        }

        return genericRoute.test(path);
    }

    static createPathSegmentListFromPath(path) {
        if(!this.isValidPath(path)) {
            throw new InvalidRouteError(`Invalid route path : ${path}`, path);
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
                    throw new InvalidRouteError(`Path segment: '${relativePathString}' is invalid from current path : '${currentPathString}'`, relativePathString);
                }
                
                newPathSegmentList.pop();
            }
            else {
                newPathSegmentList.push(segment);
            }
        }

        return newPathSegmentList;

    }
}

export {UrlUtils};