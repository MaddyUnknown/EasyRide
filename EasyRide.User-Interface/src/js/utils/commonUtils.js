function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    }
}

function throttle(func, limit) {
    let lastFunc;
    let lastRan;

    return function(...args) {
        const context = this;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if (Date.now() - lastRan >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

function asycWait(timeoutMs) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), timeoutMs);
    });
} 


function isNullOrUndefined(value) {
    if(value === null || value === undefined) {
        return true;
    } else {
        return false;
    }
}

export {debounce, throttle, asycWait, isNullOrUndefined};