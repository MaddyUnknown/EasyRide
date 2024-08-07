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
        this._view.setSeatConfig(this._getData());
    }

    destroy() {

    }

    _getData() {
        return [
                { X:0, Y:0, Z:0, type: 'seater'},
                { X:0, Y:1, Z:0, type: 'seater'},
                { X:0, Y:2, Z:0, type: 'seater'},
                { X:0, Y:3, Z:0, type: 'seater'},
                { X:0, Y:4, Z:0, type: 'seater'},
                { X:0, Y:5, Z:0, type: 'seater'},
                { X:0, Y:6, Z:0, type: 'seater'},
                { X:0, Y:7, Z:0, type: 'seater'},
                { X:0, Y:8, Z:0, type: 'seater'},
                { X:0, Y:9, Z:0, type: 'seater'},
                { X:0, Y:10, Z:0, type: 'seater'},
                { X:0, Y:11, Z:0, type: 'seater'},
                { X:0, Y:12, Z:0, type: 'seater'},
                { X:0, Y:13, Z:0, type: 'sleeper', height: 2},
                { X:1, Y:0, Z:0, type: 'seater'},
                { X:1, Y:1, Z:0, type: 'seater'},
                { X:1, Y:2, Z:0, type: 'seater'},
                { X:1, Y:3, Z:0, type: 'seater'},
                { X:1, Y:4, Z:0, type: 'seater'},
                { X:1, Y:5, Z:0, type: 'seater'},
                { X:1, Y:6, Z:0, type: 'seater'},
                { X:1, Y:7, Z:0, type: 'seater'},
                { X:1, Y:8, Z:0, type: 'seater'},
                { X:1, Y:9, Z:0, type: 'seater'},
                { X:1, Y:10, Z:0, type: 'seater'},
                { X:1, Y:11, Z:0, type: 'seater'},
                { X:1, Y:12, Z:0, type: 'seater'},
                { X:1, Y:13, Z:0, type: 'sleeper', height: 2},
                { X:3, Y:0, Z:0, type: 'seater'},
                { X:3, Y:1, Z:0, type: 'seater'},
                { X:3, Y:2, Z:0, type: 'seater'},
                { X:3, Y:3, Z:0, type: 'seater'},
                { X:3, Y:4, Z:0, type: 'seater'},
                { X:3, Y:5, Z:0, type: 'seater'},
                { X:3, Y:6, Z:0, type: 'seater'},
                { X:3, Y:7, Z:0, type: 'seater'},
                { X:3, Y:8, Z:0, type: 'seater'},
                { X:3, Y:9, Z:0, type: 'seater'},
                { X:3, Y:10, Z:0, type: 'seater'},
                { X:3, Y:11, Z:0, type: 'seater'},
                { X:3, Y:12, Z:0, type: 'seater'},
                { X:3, Y:13, Z:0, type: 'sleeper', height: 2},
            ];
    }
}

export { BusSeatConfigPresenter };