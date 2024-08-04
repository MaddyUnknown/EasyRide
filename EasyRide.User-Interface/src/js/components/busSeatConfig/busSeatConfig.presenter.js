import { InvalidArgumentError } from "../../modules/errorModule";
import { BusSeatConfigView } from "./busSeatConfig.view";

class BusSeatConfigPresenter {
    constructor(view) {
        if(!(view instanceof BusSeatConfigView)) {
            throw new InvalidArgumentError('view', view);
        }
        
        this._view = view;
    }

    init() {
        this._view.setConfigData(this._getData());
    }

    destroy() {

    }

    _getData() {
        return [
            { X:0, Y:0, Z:0, type: 'seater'},
            { X:0, Y:1, Z:0, type: 'seater'},
            { X:0, Y:2, Z:0, type: 'seater'},
            { X:0, Y:3, Z:0, type: 'seater'},
            { X:0, Y:4, Z:0, type: 'sleeper'},
            { X:1, Y:0, Z:0, type: 'seater'},
            { X:1, Y:1, Z:0, type: 'seater'},
            { X:1, Y:2, Z:0, type: 'seater'},
            { X:1, Y:3, Z:0, type: 'seater'},
            { X:1, Y:4, Z:0, type: 'sleeper'},
            { X:3, Y:0, Z:0, type: 'seater'},
            { X:3, Y:1, Z:0, type: 'seater'},
            { X:3, Y:2, Z:0, type: 'seater'},
            { X:3, Y:3, Z:0, type: 'seater'},
            { X:3, Y:4, Z:0, type: 'sleeper'},
        ]
    }
}

export { BusSeatConfigPresenter };