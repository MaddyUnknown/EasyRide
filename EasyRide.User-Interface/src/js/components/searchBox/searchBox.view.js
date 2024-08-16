import { ViewBase } from "../../modules/viewModule";
import { InvalidArgumentError } from "../../modules/errorModule";
import { SearchBoxPresenter } from "./searchBox.presenter";
import  { Animation } from "../../modules/animationModule";

class SearchBoxView extends ViewBase {
    constructor() {
        super();
        this._presenter = new SearchBoxPresenter(this);
    }

    init() {
        this._container = document.querySelector('.component--search-bar');
        if(!this._container) {
            throw new InvalidArgumentError('SearchBoxContainer', this._container);
        }

        this._initElements();
        this._initErrorContainers();
        this._inputIdToProperty = {
            'boarding-point': 'boardingPoint',
            'dropping-point': 'droppingPoint',
            'boarding-date': 'boardingDate',
        };
        this.$initateEventHandlerStore();

        this._presenter.init();
    }

    destroy() {
        this._presenter.destroy();

        this.$clearEventHandlerStore();
        this._container = undefined;
        this._errorContainers = undefined;
        this._elements = undefined;
        this._inputIdToProperty = undefined;
    }

    _initElements() {
        this._elements = {
            searchForm: this._container.querySelector('.form--search-bar'),
            boardingPointInput: this._container.querySelector('#boarding-point'),
            droppingPointInput: this._container.querySelector('#dropping-point'),
            boardingDateInput: this._container.querySelector('#boarding-date'),
            toggleLocationBtn: this._container.querySelector('.btn--toggle-src-dest'),
        };
    }

    _initErrorContainers() {
        this._errorContainers = new Map([
            ['boardingPoint', this._container.querySelector(".error-message--form[data-input-id='boarding-point']")],
            ['droppingPoint', this._container.querySelector(".error-message--form[data-input-id='dropping-point']")],
            ['boardingDate', this._container.querySelector(".error-message--form[data-input-id='boarding-date']")]
        ]);
    }

    get searchData() {
        const { boardingPointInput, droppingPointInput, boardingDateInput } = this._elements;
        return {
            boardingPoint: boardingPointInput.value,
            droppingPoint: droppingPointInput.value,
            boardingDate: boardingDateInput.value
        };
    }

    set searchData(value) {
        const { boardingPoint, droppingPoint, boardingDate } = value;
        this._elements.boardingPointInput.value = boardingPoint;
        this._elements.droppingPointInput.value = droppingPoint;
        this._elements.boardingDateInput.value = boardingDate;
    }

    setErrorMessages(errorMessages) {
        for (const [key, container] of this._errorContainers.entries()) {
            if(errorMessages[key] !== undefined) {
                this._setErrorMessage(container, errorMessages[key]);
            }
        }
    }

    _setErrorMessage(container, message) {
        if(message) {
            container.textContent = message;
            container.classList.add('show');
        } else {
            container.classList.remove('show');
            setTimeout(() => container.textContent = '', 300);
        }
    }

    animateErrorsShake() {
        this._errorContainers.forEach(container => {
            Animation.animateShake(container);
        });
    }

    dispatchValidatedSearch(searchData) {
        const funcMap = this.$getStoredWrapperEventHandler('validated-search');
        if(funcMap) {
            for(const [, wrapperHandler] of funcMap.entries()) {
                wrapperHandler(searchData);
            }
        }
    }

    addEventHandler(event, handler) {
        let wrapperHandler;
        const { searchForm, toggleLocationBtn } = this._elements;
        switch (event) {
            case 'search':
                wrapperHandler = (e) => { e.preventDefault(); handler(); };
                searchForm.addEventListener('submit', wrapperHandler);
                break;
            case 'validated-search':
                wrapperHandler = (searchData) => { handler(searchData); };
                break;
            case 'input-focus-out':
                wrapperHandler = (e) => {
                    const elementId = e.target.id;
                    // debugger;
                    if (this._inputIdToProperty[elementId]) {
                        const eventData = {};
                        eventData[this._inputIdToProperty[elementId]] = true;
                        handler(eventData);
                    }
                };
                searchForm.addEventListener('focusout', wrapperHandler);
                break;
            case 'toggle-button-click':
                wrapperHandler = (e) => { e.preventDefault(); handler(); };
                toggleLocationBtn.addEventListener('click', wrapperHandler);
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

        const { searchForm, toggleLocationBtn } = this._elements;
        switch (event) {
            case 'search':
                searchForm.removeEventListener('submit', wrapperHandler);
                break;
            case 'validated-search':
                break;
            case 'input-focus-out':
                searchForm.removeEventListener('focusout', wrapperHandler);
                break;
            case 'toggle-button-click':
                toggleLocationBtn.removeEventListener('click', wrapperHandler);
                break;
        }

    }
}

export { SearchBoxView };