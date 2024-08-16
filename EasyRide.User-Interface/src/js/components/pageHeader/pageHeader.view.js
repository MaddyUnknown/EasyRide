import { InvalidArgumentError } from "../../modules/errorModule";
import { ViewBase } from "./../../modules/viewModule";
import { PageHeaderPresenter } from "./pageHeader.presenter";

class PageHeaderView extends ViewBase {

    constructor() {
        super();
        this._presenter = new PageHeaderPresenter(this);
    }

    init() {
        this._container = document.querySelector('.component--header');
        if(!this._container) {
            throw new InvalidArgumentError('PageHeaderContainer', this._container);
        }

        this._presenter.init();
    }

    destroy() {
        this._presenter.destroy();

        this._container = undefined;
    }

    setHeaderProperty({theme, position}) {
        if(theme !== undefined) {
            switch(theme) {
                case 'dark':
                    break;
                case 'light':
                    break;
                default:
                    throw new InvalidArgumentError('theme', theme);
            }
        }

        if(position !== undefined) {
            switch(position) {
                case 'absolute':
                    this._container.classList.add('absolute');
                    break;
                case 'unset':
                    this._container.classList.remove('absolute');
                    break;
                default:
                    throw new InvalidArgumentError('position', position);
            }
        }
    }
}

export { PageHeaderView };