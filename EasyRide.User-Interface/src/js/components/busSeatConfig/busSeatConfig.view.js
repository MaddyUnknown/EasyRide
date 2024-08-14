import { throttle } from "../../utils/commonUtils";
import { ViewBase } from "./../../modules/viewModule";
import { BusSeatConfigPresenter } from "./busSeatConfig.presenter";
import { DistinctRGBColorGenerator, ColorUtils } from "../../utils/colorUtils";
import { ApplicationError } from "../../modules/errorModule";
import { Animation } from "../../modules/animationModule";
import { CSSStyle } from "../../modules/cssStyleModule";

class BusSeatConfigView extends ViewBase {

    constructor() {
        super();
        this._presenter = new BusSeatConfigPresenter(this);
    }

    init() {
        this._container = document.querySelector('.component--bus-seat-config');
        if(!this._container) {
            throw new InvalidArgumentError('SeatConfigContainer', this._container);
        }

        this._deckSelectorContainer = this._container.querySelector('.container--deck-selector');
        this._canvasContainer = this._container.querySelector('.container--seat-canvas');
        this._bindDeckSelectorClickHandler = this._deckSelectorClickHandler.bind(this);
        this.$initateEventHandlerStore();
        this.addEventHandler('deck-selector-clicked', this._bindDeckSelectorClickHandler);

        this._presenter.init();
    }

    destroy() {
        this._presenter.init();
        this.removeEventHandler('deck-selector-clicked', this._bindDeckSelectorClickHandler);
        this.$clearEventHandlerStore();
        this._bindDeckSelectorClickHandler = undefined;
        this._canvasContainer = undefined;
        this._deckSelectorContainer = undefined;
        this._deckSelectorHighlight = undefined;
        this._container = undefined;
    }

    addLoadingAnimation({ container }) {
        switch(container) {
            case 'seat-config':
                return Animation.animateRippleLoading(this._container, {zIndex : 1000, align : 'center' });
            default:
                throw new InvalidArgumentError('container', container);
        }
    }

    addEventHandler(event, handler) {
        let wrapperHandler;
        switch(event) {
            case 'seat-selected':
                wrapperHandler = (e) => { handler(); };
                break;
            case 'deck-selector-clicked':
                wrapperHandler = (e) => { handler(e); };
                this._deckSelectorContainer.addEventListener('click', wrapperHandler);
                break;
            default:
                throw new InvalidArgumentError('eventType', eventType);
        }
        this.$storeEventHandler(event, handler, wrapperHandler);
    }

    removeEventHandler(event, handler) {
        const wrapperHandler = this.$getStoredWrapperEventHandler(event, handler);
        this.$removeStoredEventHandler(event, handler);
        
        if(!wrapperHandler) {
            return;
        }

        switch (event) {
            case 'deck-selector-clicked':
                this._deckSelectorContainer.removeEventListener('click', wrapperHandler);
                break;
        }
    }

    _dispatchSeatSelected(seatSelectedData) {
        const funcMap = this.$getStoredWrapperEventHandler('validate-search');
        if(funcMap) {
            for(const [, wrapperHandler] in funcMap.entries()) {
                wrapperHandler(seatSelectedData);
            }
        }
    }

    setSeatConfig(data) {
        this.clearSeatConfig();

        const zValues = data.reduce((acc, item) => {
            if(acc.findIndex(i => i === item.Z) === -1) acc.push(item.Z); 
            return acc;
        }, []).sort((a, b) => a-b);

        const maxX = Math.max(...data.map(item => item.X+(item.spanX?item.spanX-1:0)))
        const maxY = Math.max(...data.map(item => item.Y+(item.spanY?item.spanY-1:0)));

        this._seatConfigs = {deckIndexValues : this._initiateDeckSelector(zValues) };
        const initDeckCanvasResult = this._initiateAllDeckCanvas(maxX, maxY, zValues, data);
        this._setActiveZValue(0);

        Object.assign(this._seatConfigs, initDeckCanvasResult);
    }

    clearSeatConfig() {
        this._canvasContainer.innerHTML = '';
        this._deckSelectorContainer.innerHTML = '';
        this._seatConfigs = undefined;
    }

    _initiateDeckSelector(deckIndexValues) {
        const highlight = this._getDeckSelectorHighlightElement();
        this._deckSelectorContainer.appendChild(highlight);
        this._deckSelectorHighlight = highlight;

        for(let i=0; i<deckIndexValues.length; i++) {
            const element = this._getDeckSelectorElement(deckIndexValues[i], i);
            this._deckSelectorContainer.appendChild(element);
        }

        return deckIndexValues;
    }

    _initiateAllDeckCanvas(maxXIndex, maxYIndex, deckIndexValues, data) {
        const deckConfigMap = new Map();
        const seatRendererFactory = new SeatRendererFactory();
        const busGridSetting = new BusGridSetting(maxXIndex, maxYIndex);
        const canvasOrientation = this._getSeatCanvasOrientation();

        for(const z of deckIndexValues) {
            const deckConfig = this._getDeckCanvas(z, data.filter(index => index.Z === z), busGridSetting, seatRendererFactory, canvasOrientation);
            deckConfigMap.set(z.toString(), deckConfig);
            this._canvasContainer.appendChild(deckConfig.displayCanvas);
            // this._canvasContainer.appendChild(deckConfig.hitCanvas);
        }

        return {
            deckConfigMap,
            busGridSetting,
            seatRendererFactory
        }
    }

    _getSeatCanvasOrientation() {
        return CSSStyle.getCSSVariables('--bus-canvas-orientation', this._container) ?? 'vertical';
    }

    _getDeckSelectorHighlightElement() {
        const element = document.createElement('div');
        element.classList.add('highlight--deck-selector');

        return element;
    }

    _getDeckSelectorElement(zValue, zIndexPosition) {
        const element = document.createElement('div');
        element.classList.add('btn--deck-selector');
        element.dataset.position = zIndexPosition;
        element.textContent = zValue;

        return element;
    }

    _getDeckCanvas(zIndex, data, busGridSetting, seatRendererFactory, seatOrientation = 'vertical') {
        const canvas = document.createElement('canvas');
        const hitCanvas = document.createElement('canvas');
        const colorGenerator = new DistinctRGBColorGenerator(500);
        const deckConfig = { hitCanvas, displayCanvas : canvas, hitColorMap : new Map(), colorGenerator };
        
        const { width : renderWidth , height : renderHeight } = busGridSetting.getBusDimentions({upscaleDimentions : true});
        const { width, height } = busGridSetting.getBusDimentions();
        
        canvas.dataset.zIndex = zIndex;
        
        if(seatOrientation === 'horizontal') { // invert canvas dimension when horizontal
            canvas.width = renderHeight; 
            canvas.height = renderWidth;

            canvas.style.width = `${height}px`;
            canvas.style.height = `${width}px`;
            hitCanvas.width = height;
            hitCanvas.height = width;
        } else {
            canvas.width = renderWidth; 
            canvas.height = renderHeight;

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            hitCanvas.width = width;
            hitCanvas.height = height;
        }


        const ctx = canvas.getContext('2d');
        const hitCtx = hitCanvas.getContext('2d', { willReadFrequently : true });

        if(seatOrientation === 'horizontal') { // martix tranformation to transpose the drawing space
            ctx.setTransform(0, 1, -1, 0, renderHeight, 0);
            hitCtx.setTransform(0, 1, -1, 0, height, 0);
        }
        
        deckConfig.hitCanvasBackgroundColor = colorGenerator.getNextValue();
        ctx.lineWidth = 0.3*CSSStyle.RootFontSize;
        hitCtx.lineWidth = 0.2*CSSStyle.RootFontSize;
        hitCtx.fillStyle = ColorUtils.rgbStrFromObj(deckConfig.hitCanvasBackgroundColor);
        hitCtx.fillRect(0,0, hitCanvas.width, hitCanvas.height);

        if(zIndex === 'L' || zIndex === 0) {
            const renderer = seatRendererFactory.getRenderer({ type : 'driver' });
            const seatColors = ColorUtils.getSeatColor({seatType : 'driver'});
            renderer.render(ctx, busGridSetting, {}, seatColors.defaultLine, seatColors.defaultFill, {upscaleDimentions : true});
        }


        for(const seat of data) {
            const renderer = seatRendererFactory.getRenderer(seat);
            const seatColors = ColorUtils.getSeatColor({seatType : seat.type, isBooked : seat.isBooked});
            renderer.render(ctx, busGridSetting, seat, seatColors.defaultLine, seatColors.defaultFill, {upscaleDimentions : true});

            const hitColor = colorGenerator.getNextValue();
            const hitColorStr = ColorUtils.rgbStrFromObj(hitColor);
            renderer.render(hitCtx, busGridSetting, seat, hitColorStr, hitColorStr, {clearCanvas : false});

            deckConfig.hitColorMap.set(hitColor, { data: seat, state: {} });
        }

        canvas.addEventListener('click', this._canvasClickHandler.bind(this));
        canvas.addEventListener('mousemove', throttle(this._canvasHoverHandler.bind(this), 50));

        return deckConfig;
    }

    _setActiveZValue(zIndexPosition) {


        const elementList = [...this._deckSelectorContainer.querySelectorAll(`.btn--deck-selector`)];
        const currentActive = elementList.find(x => x.classList.contains('active'));
        if(currentActive) {
            currentActive.classList.remove('active');
        }

        const newActive = elementList.find(x=>x.dataset.position === zIndexPosition.toString());
        if(!newActive) {
            return;
        }
        newActive.classList.add('active');

        if(this._deckSelectorHighlight) {
            this._deckSelectorHighlight.style.transform = `translateX(${zIndexPosition*100}%)`;
        }

        const currentActiveCanvas = this._canvasContainer.querySelector(`canvas.active`);
        if(currentActiveCanvas) {
            currentActiveCanvas.classList.remove('active');
        }
        
        const newActiveCanvas = this._canvasContainer.querySelector(`canvas[data-z-index="${newActive.textContent}"]`);
        newActiveCanvas.classList.add('active');
    }

    _canvasClickHandler(e) {
        e.preventDefault();
        const canvas = e.target.closest('.component--bus-seat-config canvas');
        if(!canvas) {
            return;
        }
        

        const deckConfig = this._seatConfigs?.deckConfigMap?.get(canvas.dataset.zIndex);
        if(!deckConfig) {
            return;
        }
        
        const rect = canvas.getBoundingClientRect();
        const mousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        const hitCtx = deckConfig.hitCanvas.getContext('2d');
        const ctx = deckConfig.displayCanvas.getContext('2d');
        const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
        const color = { r: pixel[0] , g: pixel[1], b: pixel[2] };
        const key = deckConfig.hitColorMap.keys().find(x => ColorUtils.isSimilar(color, x, deckConfig.colorGenerator.step*0.1));

        if(key && !deckConfig.hitColorMap.get(key)?.data?.isBooked) {
            const seat = deckConfig.hitColorMap.get(key);
            const renderer = this._seatConfigs.seatRendererFactory.getRenderer(seat.data);
            const seatColors = ColorUtils.getSeatColor({seatType : seat.data.type});

            if(seat.state.isSelected) {
                seat.state.isSelected = false;
                renderer.render(ctx, this._seatConfigs?.busGridSetting, seat.data, seatColors.defaultLine, seatColors.defaultFill, {upscaleDimentions : true});
            } else{
                seat.state.isSelected = true;
                renderer.render(ctx, this._seatConfigs?.busGridSetting, seat.data, seatColors.selectedLine, seatColors.selectedFill, {upscaleDimentions : true});
            }

            this._dispatchSeatSelected(seat);
        }
    }

     _canvasHoverHandler(e) {
         const canvas = e.target.closest('.component--bus-seat-config canvas');
         if(!canvas) {
             return;
            }
            
            
        const deckConfig = this._seatConfigs?.deckConfigMap?.get(canvas.dataset.zIndex);
        if(!deckConfig) {
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const mousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        const ctx = deckConfig.hitCanvas.getContext('2d');
        const pixel = ctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
        const color = { r: pixel[0] , g: pixel[1], b: pixel[2] };
        
        const key = deckConfig.hitColorMap.keys().find(x => ColorUtils.isSimilar(color, x, deckConfig.colorGenerator.step*0.1));
        this._canvasContainer.appendChild(deckConfig.hitCanvas);
        if(key) {
            const isBooked = deckConfig.hitColorMap.get(key)?.data?.isBooked;
            if(isBooked) {
                canvas.style.cursor = 'not-allowed';
            } else {
                canvas.style.cursor = 'pointer';
            }
        } else {
            canvas.style.cursor = 'default';
        }
    }

    _deckSelectorClickHandler(e) {
        const element = e.target.closest('.btn--deck-selector');
        if(!element) {
            return;
        }

        const position = element.dataset.position;
        if(position) {
            this._setActiveZValue(position);
        }
    }
}

class SeatRendererBase {
    render(ctx, gridSetting, seatData, lineColor, fillColor, { upscaleDimentions = false, clearCanvas = true } = {}) {
        this._render(ctx, gridSetting, seatData, lineColor, fillColor, {upscaleDimentions, clearCanvas});
    }

    _render(ctx, gridSetting, seatData, lineColor, fillColor, {upscaleDimentions, clearCanvas}) {
        throw new Error(`Render method is not implemented`);
    }
}

class SeaterSeatRenderer extends SeatRendererBase {
    constructor() {
        super();
    }
    
    _render(ctx, gridSetting, seatData, lineColor, fillColor, {upscaleDimentions, clearCanvas}) {
        const { seatX : x, seatY : y, seatWidth : boxWidth, seatHeight : boxHeight } = gridSetting.getSeatDimentions(seatData.X, seatData.Y, seatData.spanX, seatData.spanY, upscaleDimentions);
        
        if(clearCanvas === true) {
            ctx.clearRect(x, y, boxWidth, boxHeight);
        }
        
        const size = Math.min(boxWidth, boxHeight)*0.7;
        const seatRadius = 0.1*size;
        const seatWidth = size, seatHeight = 0.63*size;
        const seatX = x + (boxWidth-size)/2, seatY = y + (boxHeight-size)/2 + size - seatHeight;
        
        const backRestRadius = 0.17*size;
        const backRestX = x + (boxWidth-size)/2 + 0.09*size, backRestY = y + (boxHeight-size)/2;
        const backRestWidth = size-0.18*size, backRestHeight = size-seatHeight;
        
        ctx.strokeStyle = lineColor;
        ctx.fillStyle = fillColor;


        ctx.beginPath();
        ctx.moveTo(seatX+seatRadius, seatY);
        ctx.arcTo(seatX, seatY, seatX, seatY+seatRadius, seatRadius);
        ctx.lineTo(seatX, seatY+seatHeight);
        ctx.lineTo(seatX+seatWidth, seatY+seatHeight);
        ctx.lineTo(seatX+seatWidth, seatY+seatRadius);
        ctx.arcTo(seatX+seatWidth, seatY, seatX+seatWidth-seatRadius, seatY, seatRadius);
        ctx.moveTo(backRestX, backRestY+backRestHeight);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = lineColor;
        ctx.fillStyle = fillColor;

        ctx.beginPath();
        ctx.moveTo(backRestX, backRestY+backRestHeight);
        ctx.lineTo(backRestX, backRestY + backRestRadius);
        ctx.arcTo(backRestX, backRestY, backRestX + backRestRadius , backRestY, backRestRadius);
        ctx.lineTo(backRestX + backRestWidth - backRestRadius, backRestY);
        ctx.arcTo(backRestX + backRestWidth , backRestY, backRestX + backRestWidth, backRestY + backRestRadius, backRestRadius);
        ctx.lineTo(backRestX + backRestWidth, backRestY + backRestHeight);
        ctx.arcTo(backRestX + backRestWidth - seatRadius, backRestY + backRestHeight, backRestX + backRestWidth - seatRadius, backRestY + backRestHeight + seatRadius, seatRadius);
        ctx.lineTo(seatX+seatWidth-seatRadius*2, seatY+seatHeight-seatRadius*2);
        ctx.lineTo(seatX+seatRadius*2, seatY+seatHeight-seatRadius*2);
        ctx.lineTo(seatX+seatRadius*2, seatY+seatRadius);
        ctx.arcTo(seatX+seatRadius*2, seatY, seatX+seatRadius, seatY, seatRadius);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

    }
}

class SleeperSeatRenderer extends SeatRendererBase {
    constructor() {
        super();
    }

    _render(ctx, gridSetting, seatData, lineColor, fillColor, {upscaleDimentions, clearCanvas}) {
        const { seatX : x, seatY : y, seatWidth : boxWidth, seatHeight : boxHeight } = gridSetting.getSeatDimentions(seatData.X, seatData.Y, seatData.spanX, seatData.spanY, upscaleDimentions);
        
        if(clearCanvas) {
            ctx.clearRect(x, y, boxWidth, boxHeight);
        }

        const bedHeight = boxHeight*0.7;
        const bedWidth = boxWidth/2;
        const bedX = x + (boxWidth-bedWidth)/2, bedY = y + (boxHeight-bedHeight)/2;
        const bedRadius = 0.17*bedWidth;
        
        const pillowRadius = 0.09*bedWidth;
        const pillowWidth = bedWidth - 0.26*bedWidth;
        const pillowHeight = 2*pillowRadius;
        const pillowX = bedX+0.13*bedWidth, pillowY = bedY+0.1*bedHeight;
        
        
        ctx.strokeStyle = lineColor;
        ctx.fillStyle = fillColor;

        //ctx.strokeRect(x, y, boxWidth, boxHeight);

        ctx.beginPath();
        ctx.moveTo(bedX+bedRadius, bedY);
        ctx.lineTo(bedX+bedWidth-bedRadius, bedY);
        ctx.arcTo(bedX+bedWidth, bedY, bedX+bedWidth, bedY+bedRadius, bedRadius);
        ctx.lineTo(bedX+bedWidth, bedY+bedHeight-bedRadius);
        ctx.arcTo(bedX+bedWidth, bedY+bedHeight, bedX+bedWidth-bedRadius, bedY+bedHeight, bedRadius);
        ctx.lineTo(bedX+bedRadius, bedY+bedHeight);
        ctx.arcTo(bedX, bedY+bedHeight, bedX, bedY+bedHeight-bedRadius, bedRadius);
        ctx.lineTo(bedX, bedY+bedRadius);
        ctx.arcTo(bedX, bedY, bedX+bedRadius, bedY, bedRadius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = lineColor;
        ctx.fillStyle = fillColor;

        ctx.beginPath();
        ctx.moveTo(pillowX+pillowRadius, pillowY);
        ctx.lineTo(pillowX+pillowWidth-pillowRadius, pillowY);
        ctx.arcTo(pillowX+pillowWidth, pillowY, pillowX+pillowWidth, pillowY+pillowRadius, pillowRadius);
        ctx.lineTo(pillowX+pillowWidth, pillowY+pillowHeight-pillowRadius);
        ctx.arcTo(pillowX+pillowWidth, pillowY+pillowHeight, pillowX+pillowWidth-pillowRadius, pillowY+pillowHeight, pillowRadius);
        ctx.lineTo(pillowX+pillowRadius, pillowY+pillowHeight);
        ctx.arcTo(pillowX, pillowY+pillowHeight, pillowX, pillowY+pillowHeight-pillowRadius, pillowRadius);
        ctx.lineTo(pillowX, pillowY+pillowRadius);
        ctx.arcTo(pillowX, pillowY, pillowX+pillowRadius, pillowY, pillowRadius);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();
    }
}

class DriverSeatRenderer extends SeatRendererBase {
    constructor() {
        super();
    }

    _render(ctx, gridSetting, seatData, lineColor, fillColor, {upscaleDimentions, clearCanvas}) {
        const { seatX : x, seatY : y, seatWidth : boxWidth, seatHeight : boxHeight } = gridSetting.getDriverSeatDimentions(upscaleDimentions);
        
        if(clearCanvas) {
            ctx.clearRect(x, y, boxWidth, boxHeight);
        }
        
        // Define the parameters for the steering wheel
        const size = Math.min(boxHeight, boxWidth)*0.38;
        const centerX = x + boxWidth / 2;
        const centerY = y + boxHeight / 2;
        const outerRadius = size;
        const innerRadius = size*0.25;
        const originalLineWidth = ctx.lineWidth;
        
        ctx.lineWidth = originalLineWidth*2;
        ctx.strokeStyle = lineColor;
        ctx.fillStyle = fillColor;

        
        // Draw the outer rim
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw the inner circle (hub)
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Draw the spokes
        const numberOfSpokes = 3;
        for (let i = 0; i < numberOfSpokes; i++) {
            const angle = (i * 2 * Math.PI) / numberOfSpokes;
            const xStart = centerX + innerRadius * Math.cos(angle);
            const yStart = centerY + innerRadius * Math.sin(angle);
            const xEnd = centerX + outerRadius * Math.cos(angle);
            const yEnd = centerY + outerRadius * Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(xStart, yStart);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();
        }

        ctx.lineWidth = originalLineWidth;
    }
}

class SeatRendererFactory {
    constructor() {
        this._cachedRenderers = new Map();
    }

    getRenderer(seat) {
        if(!this._cachedRenderers.has(seat.type)) {
            let renderer = null;
            switch(seat.type) {
                case 'seater': 
                    renderer = new SeaterSeatRenderer();
                    break;
                case 'sleeper': 
                    renderer = new SleeperSeatRenderer();
                    break;
                case 'driver':
                    renderer = new DriverSeatRenderer();
                    break;
                default:
                    throw new ApplicationError(`Renderer not found for seat type : ${seat.type}`);
            }

            this._cachedRenderers.set(seat.type, renderer);
        }

        return this._cachedRenderers.get(seat.type);
    }
}

class BusGridSetting {
    constructor(maxXIndex, maxYIndex, {gridPaddingX = 1.5, gridPaddingY = 1, gridItemHeight = 3.5, gridItemWidth = 4.5, driverSeatPaddingY = 1.5, dpi = 3, driverSeatOrientation = 'left'} = {}) {
        this._maxXIndex = maxXIndex;
        this._maxYIndex = maxYIndex;
        this._gridPaddingX = gridPaddingX;
        this._gridPaddingY = gridPaddingY;
        this._gridItemHeight = gridItemHeight;
        this._driverSeatOrientation = driverSeatOrientation;
        this._gridItemWidth = gridItemWidth;
        this._driverSeatPaddingY = driverSeatPaddingY;

        this._DPI = dpi;
    }

    getSeatDimentions(seatXIndex, seatYIndex, seatSpanX = 1, seatSpanY = 1, upscaleDimentions = false) {
        const rootFontSize = CSSStyle.RootFontSize;

        const seatX = (seatXIndex*this._gridItemWidth + this._gridPaddingX)*(upscaleDimentions?this._DPI:1)*rootFontSize;
        const seatY = ((this._maxYIndex-seatYIndex-seatSpanY+1)*this._gridItemHeight + this._gridPaddingY)*(upscaleDimentions?this._DPI:1)*rootFontSize;
        const seatWidth = (seatSpanX*this._gridItemWidth)*(upscaleDimentions?this._DPI:1)*rootFontSize; 
        const seatHeight = ((seatSpanY)*this._gridItemHeight)*(upscaleDimentions?this._DPI:1)*rootFontSize;

        return { seatX, seatY, seatWidth, seatHeight };
    }

    getDriverSeatDimentions(upscaleDimentions = false) {
        const rootFontSize = CSSStyle.RootFontSize;

        const seatWidth = this._gridItemWidth*(upscaleDimentions?this._DPI:1)*rootFontSize;
        const seatHeight = this._gridItemHeight*(upscaleDimentions?this._DPI:1)*rootFontSize;
        
        let seatX;
        if(this._driverSeatOrientation === 'left') {
            seatX = this._gridPaddingX*(upscaleDimentions?this._DPI:1)*rootFontSize;
        } else {
            seatX = ((this._maxXIndex)*this._gridItemWidth + this._gridPaddingX)*(upscaleDimentions?this._DPI:1)*rootFontSize;
        }

        const seatY = ((this._maxYIndex+1)*this._gridItemHeight + this._gridPaddingY + this._driverSeatPaddingY)*(upscaleDimentions?this._DPI:1)*rootFontSize;

        return { seatX, seatY, seatWidth, seatHeight };
    }

    getBusDimentions(upscaleDimentions = false) {
        const rootFontSize = CSSStyle.RootFontSize;

        const width = ((this._maxXIndex+1)*this._gridItemWidth + this._gridPaddingX*2)*(upscaleDimentions?this._DPI:1)*rootFontSize; 
        const height = ((this._maxYIndex+2)*this._gridItemHeight + this._gridPaddingY*2 + this._driverSeatPaddingY)*(upscaleDimentions?this._DPI:1)*rootFontSize;

        return {width, height};
    }
}

export { BusSeatConfigView };