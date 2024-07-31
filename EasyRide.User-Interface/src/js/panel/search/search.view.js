import html from "bundle-text:../../../html/search.html";

import { SearchBoxView } from "../../components/searchBox/searchBox.view";
import { PanelViewBase } from "../../modules/viewModule";
import { SearchPanelPresenter } from "./search.presenter";

class SearchPanelView extends PanelViewBase {
    constructor() {
        super();
        this._presenter = new SearchPanelPresenter(this);
        this._searchBox = new SearchBoxView();
    }

    static get $PANEL_TEMPLATE() {
        if(!SearchPanelView._pageTemplate) {
            const template = document.createElement('template');
            const contentStr = html.trim();
            template.innerHTML = contentStr;
            SearchPanelView._pageTemplate = template;
        }

        return SearchPanelView._pageTemplate.content.cloneNode(true);
    }

    init() {
        this._searchResultContainer = document.querySelector('.search-result-list');
        this._resolveFilterSectionScrollVisibality();
        
        this._addFilterSectionResizeHandler();
        this._searchBox.init();
        this._presenter.init();
    }

    destroy() {
        this._presenter.destroy();
        this._searchBox.destroy();
        this._removeFilterSectionResizeHandler();
    }

    addSearchBusHandler(handler) {
        this._searchBox.addSearchHandler(handler);
    }

    removeSearchBusHandler(handler) {
        this._searchBox.removeSearchHandler(handler);
    }

    get searchData() {
        return this._searchBox.formData;
    }

    set searchData(value) {
        this._searchBox.formData = value;
    }

    setSearchResultData(searchResultList) {
        for(const searchItem of searchResultList) {
            this._searchResultContainer.insertAdjacentHTML('beforeend', this._getHtmlForSearchItem(searchItem));
        }
    }

    _addFilterSectionResizeHandler() {
        window.addEventListener('resize', this._resolveFilterSectionScrollVisibality.bind(this));
    }

    _removeFilterSectionResizeHandler() {
        window.removeEventListener('resize', this._resolveFilterSectionScrollVisibality.bind(this));
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

export {SearchPanelView};