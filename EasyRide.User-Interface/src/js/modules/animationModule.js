class Animate {
    static async fadeIn(element, duration, type='ease-in-out') {
        element.style.animation = `fade-in ${duration}ms ${type}`;
        await sleep(duration);
        element.style.opacity = 1;
        element.style.animation = 'none';
    }
}

const sleep = function(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {resolve(true)}, duration);
    });
}

export {Animate, sleep};