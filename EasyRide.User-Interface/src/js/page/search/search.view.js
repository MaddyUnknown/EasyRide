class SearchPageView {
    constructor() {
        this._searchForm = document.querySelector('.form--search-bar');
        this._boardingPointInput = document.querySelector('#boarding-point');
        this._droppingPointInput = document.querySelector('#dropping-point');
        this._boardingDateInput = document.querySelector('#boarding-date');

        this._searchResultContainer = document.querySelector('.search-result-list');

        this._searchBusHandlers = [];


        this._resolveFilterSectionScrollVisibality();
    }

    get boardingPoint() {
        return this._boardingPointInput.value;
    }

    set boardingPoint(value) {
        this._boardingPointInput.value = value;
    }

    get droppingPoint() {
        return this._droppingPointInput.value;
    }

    set droppingPoint(value) {
        this._droppingPointInput.value = value;
    }

    get boardingDate() {
        return this._boardingDateInput.value;
    }

    set boardingDate(value) {
        this._boardingDateInput.value = value;
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

    addFilterSectionResizeHandler() {
        window.addEventListener('resize', this._resolveFilterSectionScrollVisibality.bind(this));
    }

    removeFilterSectionResizeHandler() {
        window.removeEventListener('resize', this._resolveFilterSectionScrollVisibality.bind(this));
    }


    setSearchResultData(searchResultList) {
        for(const searchItem of searchResultList) {
            this._searchResultContainer.insertAdjacentHTML('beforeend', this._getHtmlForSearchItem(searchItem));
        }
    }


    _resolveFilterSectionScrollVisibality() {
        const viewportHeight = window.innerHeight;
        const filterSection = document.querySelector('.section--filters');
        const containerHeight = filterSection.scrollHeight;

        if (containerHeight > viewportHeight) {
            filterSection.classList.add('scrollable');
        } else {
            filterSection.classList.remove('scrollable');
        }
    }

    _getHtmlForSearchItem(searchItem) {
        // Fill it up later;
        return `
            <li class="search-result-item" data-index="${searchItem.id}">
                <div class="container--bus-general-details">
                    <p class="bus-name">${searchItem.busName}</p>
                    <p class="bus-seat-config-name">${searchItem.seatConfigName}</p>
                    <div class="container--bus-rating-review">
                        <div class="container--bus-rating">
                            <ion-icon name="star"></ion-icon>
                            <p class="bus-rating">4.6</p>
                        </div>
                        <div class="container--bus-reviews">
                            <ion-icon class="bus-rating-icon" name="people-outline"></ion-icon>
                            <p class="bus-reviews">${searchItem.totalReviews}</p>
                        </div>
                    </div>
                </div>
                <div class="container--bus-time-details">
                    <p class="trip-duration">09h 45m</p>
                    <p class="container--boarding-time">
                        <span class="container--location-icon">
                            <ion-icon class="location-icon" name="ellipse-outline"></ion-icon>
                        </span>
                        <span class="boarding-time">22:30</span>
                    </p>
                    <p class="container--dropping-time">
                        <span class="container--location-icon">
                            <ion-icon class="location-icon" name="ellipse-outline"></ion-icon>
                        </span>
                        <span class="dropping-time">08:25</span>
                        <span class="dropping-days">+9</span>
                    </p>
                    <p class="boarding-location">Kolkata</p>
                    <p class="dropping-location">Tenzing Norgay Bus Terminus</p>
                </div>
                <div class="container--bus-seat-cost">
                    <p>Starts from</p>
                    <p><span class="seat-cost-currency">INR</span> <span class="bus-seat-cost">1200</span></p>
                </div>
                <div class="container--bus-seat-available">
                    <span class="bus-seat-available">12</span> seats available
                </div>
                <div>
                    <button class="btn--view-seats">
                        View Seats
                    </button>
                </div>
            </li>`;
    }
}

export {SearchPageView};