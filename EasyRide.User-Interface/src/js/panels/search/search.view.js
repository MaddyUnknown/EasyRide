import html from "bundle-text:../../../html/search.html";
import searchItemTemplate from "bundle-text:../../../html/templates/searchItem.html";

import { SearchBoxView } from "../../components/searchBox/searchBox.view";
import { BusSeatConfigView } from "../../components/busSeatConfig/busSeatConfig.view";
import { PanelViewBase } from "../../modules/viewModule";
import { SearchPanelPresenter } from "./search.presenter";
import { DateUtils } from "../../utils/dateUtils";
import { Animation } from "../../modules/animationModule";

class SearchPanelView extends PanelViewBase {
    constructor() {
        super();
        this._presenter = new SearchPanelPresenter(this);
        this._searchBox = new SearchBoxView();
        this._busSeatConfig = new BusSeatConfigView();
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
        this._container = document.querySelector('.panel--search');
        this._searchResultContainer = this._container.querySelector('.section--search-result');
        this._searchResultMessageContainer = this._container.querySelector('.search-result-message');
        this._searchResultList = this._searchResultContainer.querySelector('.search-result-list');
        this._busSeatSelectorContainer = this._container.querySelector('.overlay--bus-seat-selection');

        this._resolveFilterSectionScrollVisibality();
        
        this._addFilterSectionResizeHandler();
        this._searchBox.init();
        this._busSeatConfig.init();
        this._presenter.init();
    }

    destroy() {
        this._presenter.destroy();
        this._busSeatConfig.destroy();
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
        this._searchResultList.innerHTML = '';
        if(searchResultList.length === 0) {
            this._searchResultMessageContainer.textContent = 'No bus available!';
            return;
        } else {
            this._searchResultMessageContainer.textContent = '';
            for(const searchItem of searchResultList) {
                this._searchResultList.appendChild(this._getSearchItemElement(searchItem));
            }
        }
    }

    addLoadingAnimationToSearchResult() {
        this._stopSearchLoadingAnimation = Animation.animateRippleLoading(this._searchResultContainer);
    }

    removeLoadingAnimationFromSearchResult() {
        if(this._stopSearchLoadingAnimation) {
            this._stopSearchLoadingAnimation();
            this._searchLoadingAnimation = undefined;
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

    _getSearchItemElement(searchItem) {
        if(!SearchPanelView._searchItemTemplate) {
            const template = document.createElement('template');
            template.innerHTML = searchItemTemplate.trim();
            SearchPanelView._searchItemTemplate = template;
        }

        const itemContainer = SearchPanelView._searchItemTemplate.content.cloneNode(true);

        itemContainer.querySelector('.search-result-item').dataset.index = searchItem.id;
        itemContainer.querySelector('.bus-name').textContent = searchItem.name;
        itemContainer.querySelector('.bus-seat-config-name').textContent = searchItem.seatConfigName;
        itemContainer.querySelector('.bus-rating').textContent = searchItem.rating;
        itemContainer.querySelector('.bus-reviews').textContent = searchItem.reviews;
        itemContainer.querySelector('.boarding-time').textContent = DateUtils.getHourMinStringFromDateISO(searchItem.boardingTime);
        itemContainer.querySelector('.dropping-time').textContent = DateUtils.getHourMinStringFromDateISO(searchItem.droppingTime);
        itemContainer.querySelector('.boarding-location').textContent = searchItem.boardingPoint;
        itemContainer.querySelector('.dropping-location').textContent = searchItem.droppingPoint;
        itemContainer.querySelector('.bus-seat-cost').textContent = searchItem.minCost;
        itemContainer.querySelector('.bus-seat-available').textContent = searchItem.availableSeat;
        itemContainer.querySelector('.trip-duration').textContent = DateUtils.getDifferenceStringForDateISO(searchItem.boardingTime, searchItem.droppingTime);

        
        const dayDiff = DateUtils.getDaysDifferenceForDateISO(searchItem.boardingTime, searchItem.droppingTime);
        if(dayDiff !== 0) {
            itemContainer.querySelector('.dropping-days').textContent = `+${dayDiff}`;
        }

        return itemContainer;
    }
}

export {SearchPanelView};