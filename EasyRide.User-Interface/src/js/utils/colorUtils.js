import { CSSStyle } from "../modules/cssStyleModule";

class DistinctRGBColorGenerator {
    constructor(n) {
        const step = Math.max(1, Math.floor(Math.cbrt(256 ** 3 / n)));
        if(!step || step < 0) {
            throw new Error(`${DistinctRGBColorGenerator.name} cannot generate ${n} distinct colors`);
        }

        this.step = step;

        this._iterator = (function* generator(s) {
            for (let r = 0; r < 256; r += s) {
                for (let g = 0; g < 256; g += s) {
                    for (let b = 0; b < 256; b += s) {
                        yield { r, g, b};
                        n--;
                        if (n <= 0) {
                            return;
                        }
                    }
                }
            }
        })(step);
    }

    getNextValue() {
        const value = this._iterator.next().value;
        if(value === undefined) {
            throw new Error(`Cannot generate any more color`);
        }
        return value;
    }
}

class ColorUtils {
    static isSimilar(color1, color2, threshold) {
        const distance = Math.sqrt(Math.pow(color1.r-color2.r, 2)+Math.pow(color1.g-color2.g, 2)+Math.pow(color1.b-color2.b, 2));
        return distance < threshold;
    }

    static rgbStrFromObj({r, g, b}) {
        return `rgb(${r},${g},${b})`;
    }

    static getSeatColor({seatType}) {
        const propertyName = `--seat--${seatType}`;
        
        if(!this._seatColorMap) {
            this._seatColorMap = new Map();
        }

        if(this._seatColorMap.has(propertyName)) {
            return this._seatColorMap.get(propertyName);
        } else {
            const defaultLine = CSSStyle.getCSSVariables(`${propertyName}--default-line-color`);
            const defaultFill = CSSStyle.getCSSVariables(`${propertyName}--default-fill-color`);
            const selectedLine = CSSStyle.getCSSVariables(`${propertyName}--selected-line-color`);
            const selectedFill = CSSStyle.getCSSVariables(`${propertyName}--selected-fill-color`);

            const value = {
                defaultLine,
                defaultFill,
                selectedLine,
                selectedFill
            }

            this._seatColorMap.set(propertyName, value);

            return value;
        }
    }
}

export { DistinctRGBColorGenerator, ColorUtils };