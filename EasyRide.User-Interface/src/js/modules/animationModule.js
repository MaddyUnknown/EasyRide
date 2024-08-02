class Animation {
    static animateRippleLoading(container) {
        const animationElem = document.createElement('div');
        animationElem.classList.add('lds-ripple');
        animationElem.innerHTML = '<div></div><div></div>';

        const rippleOverlay = document.createElement('div');
        rippleOverlay.classList.add('loading-overlay');
        rippleOverlay.appendChild(animationElem);

        container.style.position = 'relative'
        container.appendChild(rippleOverlay);
        rippleOverlay.classList.add('show');

        return () => {
            rippleOverlay.innerHTML = '';
            rippleOverlay.classList.remove('show');
            setTimeout(() => {
                rippleOverlay.remove();
                container.style.removeProperty('position');
            }, 300);
        }
    }

    static animateShake(container) {
        container.classList.add('shake-animation');
        setTimeout(() => container.classList.remove('shake-animation'), 600);
    }
}

export {Animation};