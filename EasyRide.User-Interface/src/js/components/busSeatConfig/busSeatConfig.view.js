import { debounce, throttle } from "../../utils/commonUtils";
import { ViewBase } from "./../../modules/viewModule";
import { BusSeatConfigPresenter } from "./busSeatConfig.presenter";

class BusSeatConfigView extends ViewBase {
    constructor() {
        super();
        this._presenter = new BusSeatConfigPresenter(this);
    }

    init() {
        this._initElements();
        this._presenter.init();
    }

    destroy() {
        this._presenter.init();
        this._container = undefined;
    }

    _initElements() {
        this._container = document.querySelector('.component--bus-seat-config');
    }

    setSeatConfig(data) {
        this._container.innerHTML = '';
        this._deckConfigMap = new Map();
        
        const zValues = data.reduce((acc, item) => {
            if(acc.findIndex(i => i === item.Z) === -1) acc.push(item.Z); 
            return acc;
        }, []).sort((a, b) => a-b);

        //For width and heigh on the last element this will not work. TO-DO fix for the same
        const maxX = Math.max(...data.map(item => item.X)), maxY = Math.max(...data.map(item => item.Y));

        for(const z of zValues) {
            const deckConfig = this._createDeckConfig(data.filter(index => index.Z === z), maxX, maxY, z);
            this._deckConfigMap.set(z.toString(), deckConfig);
            this._container.appendChild(deckConfig.displayCanvas);
        }
    }

    _createDeckConfig(data, maxXIndex, maxYIndex, zIndex) {
        const canvas = document.createElement('canvas');
        const hitCanvas = document.createElement('canvas');
        const colorIterator = generateDistinctRgbColors(1000);
        const deckConfig = { hitCanvas, displayCanvas : canvas, hitColorMap : new Map()};

        canvas.width = hitCanvas.width = (maxXIndex+1)*BusSeatConfigViewConfig.GRID_WIDTH + BusSeatConfigViewConfig.CANVAS_PADDING_X*2; 
        canvas.height = hitCanvas.height = (maxYIndex+2)*BusSeatConfigViewConfig.GRID_HEIGHT + BusSeatConfigViewConfig.CANVAS_PADDING_Y*2 + BusSeatConfigViewConfig.BUS_DRIVER_Y_PADDING; // + 2 for driver seat
        canvas.dataset.zIndex = zIndex;

        const ctx = canvas.getContext('2d');
        const hitCtx = hitCanvas.getContext('2d'); 
        deckConfig.hitCanvasBackgroundColor = hitCtx.fillStyle = colorIterator.next().value;
        hitCtx.fillRect(0,0, hitCanvas.width, hitCanvas.height);

        for(const seat of data) {
            const seatX = seat.X*BusSeatConfigViewConfig.GRID_WIDTH + BusSeatConfigViewConfig.CANVAS_PADDING_X;
            const seatY = (maxYIndex-seat.Y-(seat.height?seat.height-1:0))*BusSeatConfigViewConfig.GRID_HEIGHT + BusSeatConfigViewConfig.CANVAS_PADDING_Y;
            const boxWidth = (seat.width??1)*BusSeatConfigViewConfig.GRID_WIDTH, boxHeight = (seat.height??1)*BusSeatConfigViewConfig.GRID_HEIGHT;
            const hitColor = colorIterator.next().value;

            if(seat.type === 'seater') {
                this._renderNormalSeat(ctx, seatX, seatY, boxWidth, boxHeight, '#5D6AB3', 'rgb(255, 255, 255)');
                this._renderNormalSeat(hitCtx, seatX, seatY, boxWidth, boxHeight, hitColor, hitColor);
            } else if(seat.type === 'sleeper') {
                this._renderSleaperSeat(ctx, seatX, seatY, boxWidth, boxHeight, '#5D6AB3', 'rgb(255, 255, 255)');
                this._renderSleaperSeat(hitCtx, seatX, seatY, boxWidth, boxHeight, hitColor, hitColor);
            }

            deckConfig.hitColorMap.set(hitColor, seat);
        }

        canvas.addEventListener('click', this._canvasClickHandler.bind(this));
        canvas.addEventListener('mousemove', throttle(this._canvasHoverHandler.bind(this), 10).bind(this));


        return deckConfig;
    }

    _renderNormalSeat(ctx, x, y, boxWidth, boxHeight, lineColor, fillColor) {
        const size = Math.min(boxWidth, boxHeight)*0.7;
        const seatRadius = 0.1*size;
        const seatWidth = size, seatHeight = 0.63*size;
        const seatX = x + (boxWidth-size)/2, seatY = y + (boxHeight-size)/2 + size - seatHeight;
        
        const backRestRadius = 0.17*size;
        const backRestX = x + (boxWidth-size)/2 + 0.09*size, backRestY = y + (boxHeight-size)/2;
        const backRestWidth = size-0.18*size, backRestHeight = size-seatHeight;
        
        ctx.strokeStyle = lineColor;
        ctx.fillStyle = fillColor;

        //ctx.strokeRect(x, y, boxWidth, boxHeight);

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

    _renderSleaperSeat(ctx, x, y, boxWidth, boxHeight, lineColor, fillColor) {
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

    _canvasClickHandler(e) {
        const canvas = e.target.closest('.component--bus-seat-config canvas');
        if(!canvas) {
            return;
        }
        

        const deckConfig = this._deckConfigMap?.get(canvas.dataset.zIndex);
        if(!deckConfig) {
            return;
        }
        
        const mousePos = {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop
        };
        
        const ctx = deckConfig.hitCanvas.getContext('2d');
        const pixel = ctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
        const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;

        if(deckConfig && deckConfig.hitColorMap.has(color)) {
            console.log(deckConfig.hitColorMap.get(color));
        } else {
            console.log(`Not in z map`);
        }
    }

     _canvasHoverHandler(e) {
        const canvas = e.target.closest('.component--bus-seat-config canvas');
        if(!canvas) {
            return;
        }
        

        const deckConfig = this._deckConfigMap?.get(canvas.dataset.zIndex);
        if(!deckConfig) {
            return;
        }
        
        const mousePos = {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop
        };

        const ctx = deckConfig.hitCanvas.getContext('2d');
        const pixel = ctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
        const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;

        if(color !== deckConfig.hitCanvasBackgroundColor) {
            canvas.style.cursor = 'pointer';
        } else {
            canvas.style.cursor = 'default';
        }
     }
}

class BusSeatConfigViewConfig {
    static GRID_WIDTH = 45;
    static GRID_HEIGHT = 35;
    static CANVAS_PADDING_X = 15;
    static CANVAS_PADDING_Y = 10;
    static BUS_DRIVER_Y_PADDING = 10;
}


function* generateDistinctRgbColors(n) {
    const step = Math.floor(Math.cbrt(256 ** 3 / n));
    const totalColors = n;
    for (let r = 0; r < 256; r += step) {
        for (let g = 0; g < 256; g += step) {
            for (let b = 0; b < 256; b += step) {
                yield `rgb(${r},${g},${b})`;
                n--;
                if (n <= 0) {
                    throw new Error(`${totalColors} colors generated`);
                }
            }
        }
    }
}

export { BusSeatConfigView };