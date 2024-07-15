import {ViewBase} from '../core/view.js';
import {viewRouterAccessor} from '../core/view-router.js';

class HomeView extends ViewBase {
    constructor(state) {
        super(state);

        this._searchForm = document.querySelector('.form--search-bar');
        this._boardingPointInput = document.querySelector('#boarding-point');
        this._droppingPointInput = document.querySelector('#dropping-point');
        this._boardingDateInput = document.querySelector('#boarding-date');
        this._searchBusBtn = document.querySelector('.btn--search');
    }

    init() {
        // add event handler
        this._searchForm.addEventListener('submit', this._seachBus.bind(this));

    }

    destroy() {
        // remove envent handler
        this._searchForm.removeEventListener('submit', this._seachBus.bind(this));
    }

    _seachBus(event) {
        event.preventDefault();
        const boardingPoint = this._boardingPointInput.value;
        const droppingPoint = this._droppingPointInput.value;
        const boardingDate = this._boardingDateInput.value;

        console.log('Home: ', boardingPoint, droppingPoint, boardingDate);

        viewRouterAccessor.ViewRouter.navigateToRoute('/search', {
            boardingPoint,
            droppingPoint,
            boardingDate
        })

    }
    
}

HomeView.$view = '/html/home.html';

export {HomeView};