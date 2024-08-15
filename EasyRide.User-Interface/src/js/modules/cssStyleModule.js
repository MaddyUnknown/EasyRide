import { InvalidArgumentError } from "./errorModule";

class CSSStyle {
    static get RootFontSize() {
        if(!this._rootFontSizeCachePx) {
            const div = document.createElement('div');
            div.style.fontSize = '1rem';
            div.style.position = 'absolute';
            div.style.opacity = '0';
            document.querySelector('body').appendChild(div);
            const fontSizeStr = getComputedStyle(div).fontSize;
            div.remove();

            if(fontSizeStr.endsWith('px')) {
                this._rootFontSizeCachePx = parseFloat(fontSizeStr.slice(0, -2));
            }
        }

        return this._rootFontSizeCachePx;
    }

    static getCSSVariables(variableName, container = null) {
        if(!variableName || !variableName.startsWith('--')) {
            throw new InvalidArgumentError('cssVariableName', variableName);
        }

        if(container && !(container instanceof HTMLElement) ) {
            throw new InvalidArgumentError('container', container);
        }

        let element = document.body;
        if(container) {
            element = container;
        }
        
        var style = getComputedStyle(element);
        return style.getPropertyValue(variableName);
    }
}

export { CSSStyle };