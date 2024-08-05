import { ViewBase } from "./../../modules/viewModule";
import { BusSeatConfigPresenter } from "./busSeatConfig.presenter";

class BusSeatConfigView extends ViewBase {
    constructor() {
        super();
        this._presenter = new BusSeatConfigPresenter(this);
    }

    init() {
        this._initCanvas();
        this._presenter.init();
    }

    destroy() {
        this._presenter.init();
    }

    _initCanvas() {
        this._container = document.querySelector('.component--bus-seat-config');
        this._canvas = this._container.querySelector('canvas');
    }

    setSeatConfig(data) {
        this._container.innerHTML = '';
        
        const zValues = data.reduce((acc, item) => {
            if(acc.findIndex(i => i === item.Z) === -1) acc.push(item.Z); 
            return acc;
        }, []).sort((a, b) => a-b);

        //For width and heigh on the last element this will not work. TO-DO fix for the same
        const maxX = Math.max(...data.map(item => item.X)), maxY = Math.max(...data.map(item => item.Y));

        for(const z of zValues) {
            this._createSeatConfigCanvas(data.filter(index => index.Z === z), maxX, maxY, z);
        }
    }

    _createSeatConfigCanvas(data, maxXIndex, maxYIndex, zIndex) {
        console.log(data);
        const canvas = document.createElement('canvas');
        canvas.width = (maxXIndex+1)*BusSeatConfigViewDimentions.GRID_WIDTH + BusSeatConfigViewDimentions.CANVAS_PADDING_X*2; 
        canvas.height = (maxYIndex+2)*BusSeatConfigViewDimentions.GRID_HEIGHT + BusSeatConfigViewDimentions.CANVAS_PADDING_Y*2 + BusSeatConfigViewDimentions.BUS_DRIVER_Y_PADDING; // + 2 for driver seat
        canvas.dataset.zIndex = zIndex;

        const ctx = canvas.getContext('2d');
        for(const coord of data) {
            const seatX = coord.X*BusSeatConfigViewDimentions.GRID_WIDTH + BusSeatConfigViewDimentions.CANVAS_PADDING_X;
            const seatY = (maxYIndex-coord.Y-(coord.height?coord.height-1:0))*BusSeatConfigViewDimentions.GRID_HEIGHT + BusSeatConfigViewDimentions.CANVAS_PADDING_Y;
            const boxWidth = (coord.width??1)*BusSeatConfigViewDimentions.GRID_WIDTH, boxHeight = (coord.height??1)*BusSeatConfigViewDimentions.GRID_HEIGHT;
            console.log(boxHeight);
            if(coord.type === 'seater') {
                console.log('here');
                this._renderNormalSeat(ctx, seatX, seatY, boxWidth, boxHeight, '#5D6AB3', 'rgb(255, 255, 255)');
            } else if(coord.type === 'sleeper') {
                this._renderSleaperSeat(ctx, seatX, seatY, boxWidth, boxHeight, '#5D6AB3', 'rgb(255, 255, 255)');
            }
        }

        this._container.appendChild(canvas);
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
}

class BusSeatConfigViewDimentions {
    static GRID_WIDTH = 45;
    static GRID_HEIGHT = 35;
    static CANVAS_PADDING_X = 15;
    static CANVAS_PADDING_Y = 10;
    static BUS_DRIVER_Y_PADDING = 10;
}

export { BusSeatConfigView };