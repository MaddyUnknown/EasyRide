class HomePageView {
    constructor() {
        this._searchForm = document.querySelector('.form--search-bar');
        this._boardingPointInput = document.querySelector('#boarding-point');
        this._droppingPointInput = document.querySelector('#dropping-point');
        this._boardingDateInput = document.querySelector('#boarding-date');
        this._toggleLocationBtn = document.querySelector('.btn--toggle-src-dest');

        this._searchBusHandlers = [];
    }

    get boardingPoint() {
        return this._boardingPointInput.value;
    }

    get droppingPoint() {
        return this._droppingPointInput.value;
    }

    get boardingDate() {
        return this._boardingDateInput.value;
    }

    addSearchBusEventHandler(handler) {
        const fun = (e) => {
            e.preventDefault();
            handler();
        };

        this._searchBusHandlers.push(fun);
        this._searchForm.addEventListener('submit', fun);
    }

    removeAllSearchBusEventHandler() {
        for(const fun of this._searchBusHandlers) {
            this._searchForm.removeEventListener('submit', fun);
        }

        this._searchBusHandlers = [];
    }

    addToggleSourceDestinationHandler() {
        this._toggleLocationBtn.addEventListener('click', this._toggleSourceDestinationHandler.bind(this));
    }

    removeToggleSourceDestinationHandler() {
        this._toggleLocationBtn.removeEventListener('click', this._toggleSourceDestinationHandler.bind(this));
    }

    _toggleSourceDestinationHandler() {
        const source = this._boardingPointInput.value;
        this._boardingPointInput.value = this._droppingPointInput.value;
        this._droppingPointInput.value = source;
    }

}

export {HomePageView};