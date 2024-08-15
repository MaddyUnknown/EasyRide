import html from "bundle-text:../../../html/search.html";
import searchItemTemplate from "bundle-text:../../../html/templates/searchItem.html";

import { SearchBoxView } from "../../components/searchBox/searchBox.view";
import { BusSeatConfigView } from "../../components/busSeatConfig/busSeatConfig.view";
import { PanelViewBase } from "../../modules/viewModule";
import { SearchPanelPresenter } from "./search.presenter";
import { DateUtils } from "../../utils/dateUtils";
import { Animation } from "../../modules/animationModule";
import { InvalidArgumentError } from "../../modules/errorModule";

class SearchPanelView extends PanelViewBase {
    constructor() {
        super();
        this._presenter = new SearchPanelPresenter(this);
        this.searchBox = new SearchBoxView();
        this.busSeatConfig = new BusSeatConfigView();
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
        if(!this._container) {
            throw new InvalidArgumentError('SearchPanelContainer', this._container);
        }

        this._initElements();
        this.$initateEventHandlerStore();
        
        this._resolveFilterSectionScrollVisibality();
        window.addEventListener('resize', this._resolveFilterSectionScrollVisibality.bind(this));
        this.searchBox.init();
        this.busSeatConfig.init();
        this._presenter.init();
    }

    destroy() {
        this._presenter.destroy();
        this.searchBox.destroy();
        this.busSeatConfig.destroy();
        window.removeEventListener('resize', this._resolveFilterSectionScrollVisibality.bind(this));

        this.$clearEventHandlerStore();
    }

    _initElements() {
        this._searchResultContainer = this._container.querySelector('.section--search-result');
        this._searchResultMessageContainer = this._container.querySelector('.search-result-message');
        this._searchResultList = this._searchResultContainer.querySelector('.search-result-list');
        this._initSeatSelectorElements();
    }

    _initSeatSelectorElements() {
        this._busSeatSelector = {};
        this._busSeatSelector.container = this._container.querySelector('.overlay--bus-seat-selection');
        this._busSeatSelector.component = this._busSeatSelector.container.querySelector('.bus-seat-selection');
        this._busSeatSelector.closeBtn = this._busSeatSelector.component.querySelector('.btn--close-bus-seat-selection');
        this._busSeatSelector.body = this._busSeatSelector.component.querySelector('.bus-seat-selection-body');

        this._busSeatSelector.bodyMainContent = this._busSeatSelector.component.querySelector('.bus-seat-selection-body-main');
        this._busSeatSelector.message = this._busSeatSelector.component.querySelector('.bus-seat-selection-error-message');
        this._busSeatSelector.sourceStop = this._busSeatSelector.body.querySelector('.details-source-stop');
        this._busSeatSelector.destStop = this._busSeatSelector.body.querySelector('.details-destination-stop');
        this._busSeatSelector.seatSelected = this._busSeatSelector.body.querySelector('.details-seats-selected');
        this._busSeatSelector.netTotal = this._busSeatSelector.body.querySelector('.details-cost-net-total');
        this._busSeatSelector.gst = this._busSeatSelector.body.querySelector('.details-cost-gst');
        this._busSeatSelector.total = this._busSeatSelector.body.querySelector('.details-cost-total');

        this._busSeatSelector.bookSeatBtn = this._busSeatSelector.body.querySelector('.btn--book-seat');
    }

    addLoadingAnimation({ container }) {
        switch(container) {
            case 'search-result':
                return Animation.animateRippleLoading(this._searchResultContainer);
            case 'seat-selection-body':
                return Animation.animateRippleLoading(this._busSeatSelector.body, {zIndex : 1000, align : 'center' });
            default:
                throw new InvalidArgumentError('container', container);
        }
    }

    showSeatConfigScreen() {
        this._busSeatSelector.container.classList.add('show');
    }

    hideSeatConfigScreen() {
        this._busSeatSelector.container.classList.remove('show');
    }

    setSeatConfigErrorMessage({message}) {
        if(message) {
            this._busSeatSelector.message.textContent = message;
            this._busSeatSelector.message.classList.remove('hidden');
            this._busSeatSelector.bodyMainContent.classList.add('hidden');
        } else {
            this._busSeatSelector.message.textContent = '';
            this._busSeatSelector.message.classList.add('hidden');
            this._busSeatSelector.bodyMainContent.classList.remove('hidden');
        }
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

    setSeatSelectionDetails({ sourceStop, destStop, seatsSelected, netTotal, gst, total } = {}) {
        if(sourceStop !== undefined) {
            this._busSeatSelector.sourceStop.textContent = sourceStop;
        }
        if(destStop !== undefined) {
            this._busSeatSelector.destStop.textContent = destStop;
        }
        if(seatsSelected !== undefined) {
            this._busSeatSelector.seatSelected.textContent = [...seatsSelected].join(', ');
        }
        if(netTotal !== undefined) {
            this._busSeatSelector.netTotal.textContent = netTotal;
        }
        if(gst !== undefined) {
            this._busSeatSelector.gst.textContent = gst;
        }
        if(total !== undefined) {
            this._busSeatSelector.total.textContent = total;
        }
        
    } 

    addEventHandler(event, handler) {
        let wrapperHandler;
        switch(event) {
            case 'seat-view':
                wrapperHandler = (e) => {
                    const viewSeatBtn = e.target.closest('.btn--view-seats');
                    if(viewSeatBtn) {
                        const busContainer = viewSeatBtn.closest('.search-result-item');
                        if(busContainer) {
                            handler({ busIndex : busContainer.dataset.index });
                        } else {
                            console.error('Bus data not found');
                        }
                    }
                }
                this._container.addEventListener('click', wrapperHandler);
                break;
            case 'close-seat-view':
                wrapperHandler = (e) => { handler(); }
                this._busSeatSelector.closeBtn.addEventListener('click', wrapperHandler);
                break;
            default:
                throw new InvalidArgumentError('eventType', eventType);
        }
        this.$storeEventHandler(event, handler, wrapperHandler);
    }

    removeEventHandler(event, handler) {
        const wrapperHandler = this.$getStoredWrapperEventHandler(event, handler);
        this.$removeStoredEventHandler(event, handler);
        if(!wrapperHandler) {
            return;
        }

        switch (event) {
            case 'seat-view':
                this._container.removeEventListener('wrapperHandler', wrapperHandler);
                break;
            case 'close-seat-view':
                this._busSeatSelector.closeBtn.removeEventListener('click', wrapperHandler);
                break;
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