import {ViewBase} from '../core/view.js';
import {viewRouterAccessor} from '../core/view-router.js';

class SearchView extends ViewBase {
    constructor(state) {
        super(state);

        this._searchForm = document.querySelector('.form--search-bar');
        this._boardingPointInput = document.querySelector('#boarding-point');
        this._droppingPointInput = document.querySelector('#dropping-point');
        this._boardingDateInput = document.querySelector('#boarding-date');
        this._searchBusBtn = document.querySelector('.btn--search');

        this.searchResultContainer = document.querySelector('.search-result-list');
        this.filterSection = document.querySelector('.section--filters');
    }

    init() {
        this._resolveFilterSectionScrollVisibality();
        window.addEventListener('resize', this._resolveFilterSectionScrollVisibality.bind(this));

        this._setSearchResultFromQueryParameters(viewRouterAccessor.ViewRouter.getQueryParameters());
    }

    destroy() {
        window.removeEventListener('resize', this._resolveFilterSectionScrollVisibality.bind(this));
    }

    _setSearchResultFromQueryParameters(queryParams = {}) {
        console.log(viewRouterAccessor.ViewRouter.getQueryParameters());
        this._boardingPointInput.value = queryParams['boardingPoint']??'';
        this._droppingPointInput.value = queryParams['droppingPoint']??'';
        this._boardingDateInput.value = queryParams['boardingDate']??'';

        if(queryParams['boardingPoint'] && queryParams['droppingPoint'] && queryParams['boardingDate']) {
            this._render();
        }
        
    }

    _resolveFilterSectionScrollVisibality() {
        const viewportHeight = window.innerHeight;
        const containerHeight = document.querySelector('.section--filters').scrollHeight;

        if (containerHeight > viewportHeight) {
            this.filterSection.classList.add('scrollable');
        } else {
            this.filterSection.classList.remove('scrollable');
        }
    }

    _render() {
        for(let i=0; i<20; i++) {
            this.searchResultContainer.insertAdjacentHTML('beforeend',
                `
                <li class="search-result-item" data-index="${i+1}">
                    <div class="container--bus-general-details">
                        <p class="bus-name">Greenline ${i+1}</p>
                        <p class="bus-seat-config-name">Volvo 9600 A/C Seater/Sleeper (2+1)</p>
                        <div class="container--bus-rating-review">
                            <div class="container--bus-rating">
                                <ion-icon name="star"></ion-icon>
                                <p class="bus-rating">4.6</p>
                            </div>
                            <div class="container--bus-reviews">
                                <ion-icon class="bus-rating-icon" name="people-outline"></ion-icon>
                                <p class="bus-reviews">450</p>
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
                </li>
                `
            );
        }
    }
    
}

SearchView.$view = '/html/search.html';

export {SearchView};