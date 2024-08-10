import { throttle } from "../../utils/commonUtils";
import { ViewBase } from "./../../modules/viewModule";
import { BusSeatConfigPresenter } from "./busSeatConfig.presenter";
import { DistinctRGBColorGenerator, ColorUtils } from "../../utils/colorUtils";
import { ApplicationError } from "../../modules/errorModule";

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

        this.$initateEventHandlerStore();
        this._presenter.init();
    }

    destroy() {
        this._presenter.init();
        this.$clearEventHandlerStore();
        this._container = undefined;
    }

    addEventHandler(event, handler) {
        let wrapperHandler;
        switch(event) {
            case 'seat-selected':
                wrapperHandler = (e) => { handler(); };
                break;
            default:
                throw new InvalidArgumentError('eventType', eventType);
        }
        this.$storeEventHandler(event, handler, wrapperHandler);
    }

    removeEventHandler(event, handler) {
        // const wrapperHandler = this.$getStoredWrapperEventHandler(event, handler);
        this.$removeStoredEventHandler(event, handler);
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
        this._container.innerHTML = '';
        
        const deckConfigMap = new Map();
        const seatRendererFactory = new SeatRendererFactory();
        const zValues = data.reduce((acc, item) => {
            if(acc.findIndex(i => i === item.Z) === -1) acc.push(item.Z); 
            return acc;
        }, []).sort((a, b) => a-b);

        const maxX = Math.max(...data.map(item => item.X+(item.spanX?item.spanX-1:0)))
        const maxY = Math.max(...data.map(item => item.Y+(item.spanY?item.spanY-1:0)));
        
        const busGridSetting = new BusGridSetting(maxX, maxY);

        for(const z of zValues) {
            const deckConfig = this._createDeckConfig(z, data.filter(index => index.Z === z), busGridSetting, seatRendererFactory);
            deckConfigMap.set(z.toString(), deckConfig);
            this._container.appendChild(deckConfig.displayCanvas);
        }

        this._seatConfigs = {
            deckConfigMap,
            busGridSetting,
            seatRendererFactory
        }
    }

    clearSeatConfig() {
        this._container.innerHTML = '';
        this._seatConfigs = undefined;
    }

    _createDeckConfig(zIndex, data, busGridSetting, seatRendererFactory) {
        const canvas = document.createElement('canvas');
        const hitCanvas = document.createElement('canvas');
        const colorGenerator = new DistinctRGBColorGenerator(500);
        const deckConfig = { hitCanvas, displayCanvas : canvas, hitColorMap : new Map(), colorGenerator };

        const { width : canvasWidth, height : canvasHeight } = busGridSetting.getBusDimentions();
        canvas.width = hitCanvas.width = canvasWidth; 
        canvas.height = hitCanvas.height = canvasHeight;
        canvas.dataset.zIndex = zIndex;


        const ctx = canvas.getContext('2d');
        const hitCtx = hitCanvas.getContext('2d', { willReadFrequently : true });
        
        deckConfig.hitCanvasBackgroundColor = colorGenerator.getNextValue();
        hitCtx.fillStyle = ColorUtils.rgbStrFromObj(deckConfig.hitCanvasBackgroundColor);
        hitCtx.lineWidth = 2;
        hitCtx.fillRect(0,0, hitCanvas.width, hitCanvas.height);

        for(const seat of data) {

            const renderer = seatRendererFactory.getRenderer(seat);
            const seatColors = ColorUtils.getSeatColor({seatType : seat.type});
            renderer.render(ctx, busGridSetting, seat, seatColors.defaultLine, seatColors.defaultFill);

            const hitColor = colorGenerator.getNextValue();
            const hitColorStr = ColorUtils.rgbStrFromObj(hitColor);
            renderer.render(hitCtx, busGridSetting, seat, hitColorStr, hitColorStr);

            deckConfig.hitColorMap.set(hitColor, { data: seat, state: {} });
        }

        canvas.addEventListener('click', this._canvasClickHandler.bind(this));
        canvas.addEventListener('mousemove', throttle(this._canvasHoverHandler.bind(this), 50));

        return deckConfig;
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
        
        const mousePos = {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop
        };
        
        const hitCtx = deckConfig.hitCanvas.getContext('2d');
        const ctx = deckConfig.displayCanvas.getContext('2d');
        const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
        const color = { r: pixel[0] , g: pixel[1], b: pixel[2] };
        const key = deckConfig.hitColorMap.keys().find(x => ColorUtils.isSimilar(color, x, deckConfig.colorGenerator.step*0.1));

        if(key) {
            const seat = deckConfig.hitColorMap.get(key);
            const renderer = this._seatConfigs.seatRendererFactory.getRenderer(seat.data);
            const seatColors = ColorUtils.getSeatColor({seatType : seat.data.type});

            if(seat.state.isSelected) {
                seat.state.isSelected = false;
                renderer.render(ctx, this._seatConfigs?.busGridSetting, seat.data, seatColors.defaultLine, seatColors.defaultFill);
            } else{
                seat.state.isSelected = true;
                renderer.render(ctx, this._seatConfigs?.busGridSetting, seat.data, seatColors.selectedLine, seatColors.selectedFill);
            }

            _dispatchSeatSelected(seat);
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
        
        const mousePos = {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop
        };

        const ctx = deckConfig.hitCanvas.getContext('2d');
        const pixel = ctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
        const color = { r: pixel[0] , g: pixel[1], b: pixel[2] };

        const key = deckConfig.hitColorMap.keys().find(x => ColorUtils.isSimilar(color, x, deckConfig.colorGenerator.step*0.1));
        if(key) {
            canvas.style.cursor = 'pointer';
        } else {
            canvas.style.cursor = 'default';
        }
    }
}

class SeatRendererBase {
    render(ctx, gridSetting, seatData, lineColor, fillColor) {
        this._render(ctx, gridSetting, seatData, lineColor, fillColor);
    }

    _render(ctx, gridSetting, seatData, lineColor, fillColor) {
        throw new Error(`Render method is not implemented`);
    }
}

class SeaterSeatRenderer extends SeatRendererBase {
    constructor() {
        super();
    }
    
    _render(ctx, gridSetting, seatData, lineColor, fillColor) {
        const { seatX : x, seatY : y, seatWidth : boxWidth, seatHeight : boxHeight } = gridSetting.getSeatDimentions(seatData.X, seatData.Y, seatData.spanX, seatData.spanY);
        
        ctx.clearRect(x, y, boxWidth, boxHeight);
        
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

    _render(ctx, gridSetting, seatData, lineColor, fillColor) {
        const { seatX : x, seatY : y, seatWidth : boxWidth, seatHeight : boxHeight } = gridSetting.getSeatDimentions(seatData.X, seatData.Y, seatData.spanX, seatData.spanY);
        
        ctx.clearRect(x, y, boxWidth, boxHeight);

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
                default:
                    throw new ApplicationError(`Renderer not found for seat type : ${seat.type}`);
            }

            this._cachedRenderers.set(seat.type, renderer);
        }

        return this._cachedRenderers.get(seat.type);
    }
}

class BusGridSetting {
    constructor(maxXIndex, maxYIndex, {gridPaddingX = 15, gridPaddingY = 10, gridItemHeight = 35, gridItemWidth = 45, driverSeatPaddingY = 10} = {}) {
        this._maxXIndex = maxXIndex;
        this._maxYIndex = maxYIndex;
        this._gridPaddingX = gridPaddingX;
        this._gridPaddingY = gridPaddingY;
        this._gridItemHeight = gridItemHeight;
        this._gridItemWidth = gridItemWidth;
        this._driverSeatPaddingY = driverSeatPaddingY;
    }

    getSeatDimentions(seatXIndex, seatYIndex, seatSpanX = 1, seatSpanY = 1) {
        const seatX = seatXIndex*this._gridItemWidth + this._gridPaddingX;
        const seatY = (this._maxYIndex-seatYIndex-seatSpanY+1)*this._gridItemHeight + this._gridPaddingY;
        const seatWidth = seatSpanX*this._gridItemWidth; 
        const seatHeight = (seatSpanY)*this._gridItemHeight;

        return { seatX, seatY, seatWidth, seatHeight };
    }

    getBusDimentions() {
        const width = (this._maxXIndex+1)*this._gridItemWidth + this._gridPaddingX*2; 
        const height = (this._maxYIndex+2)*this._gridItemHeight + this._gridPaddingY*2 + this._driverSeatPaddingY;

        return {width, height};
    }
}

export { BusSeatConfigView };