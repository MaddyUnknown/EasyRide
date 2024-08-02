import { ViewBase } from "../../modules/viewModule";
import { InvalidArgumentError } from "../../modules/errorModule";
import { SearchBoxPresenter } from "./searchBox.presenter";
import  { Animation } from "../../modules/animationModule";

class SearchBoxView extends ViewBase {
    constructor() {
        super();
        this._presenter = new SearchBoxPresenter(this);
        this.CUSTOM_VALID_SEARCH_EVENT = 'custom-validatedSearch';
    }

    init() {
        this._container = document.querySelector('.component--search-bar');
        if(!this._container) {
            throw new InvalidArgumentError('SearchBoxContainer', this._container);
        }

        this._initElements();
        this._initErrorContainers();
        this._registeredHandlers = new Map();
        this._inputIdToProperty = {
            'boarding-point': 'boardingPoint',
            'dropping-point': 'droppingPoint',
            'boarding-date': 'boardingDate',
        };

        this._presenter.init();
    }

    destroy() {
        this._presenter.destroy();

        this._container = undefined;
        this._errorContainers = undefined;
        this._elements = undefined;
        this._registeredHandlers = undefined;
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

    get formData() {
        const { boardingPointInput, droppingPointInput, boardingDateInput } = this._elements;
        return {
            boardingPoint: boardingPointInput.value,
            droppingPoint: droppingPointInput.value,
            boardingDate: boardingDateInput.value
        };
    }

    set formData(value) {
        const { boardingPoint, droppingPoint, boardingDate } = value;
        this._elements.boardingPointInput.value = boardingPoint;
        this._elements.droppingPointInput.value = droppingPoint;
        this._elements.boardingDateInput.value = boardingDate;
    }

    $setErrorMessages(errorMessages) {
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

    $animateErrorsShake() {
        this._errorContainers.forEach(container => {
            Animation.animateShake(container);
        });
    }

    addSearchHandler(handler) {
        this._elements.searchForm.addEventListener(this.CUSTOM_VALID_SEARCH_EVENT, handler);
    }

    removeSearchHandler(handler) {
        this._elements.searchForm.removeEventListener(this.CUSTOM_VALID_SEARCH_EVENT, handler);
    }

    $dispatchValidatedSearch(eventData) {
        this._elements.searchForm.dispatchEvent(new CustomEvent(this.CUSTOM_VALID_SEARCH_EVENT, { detail : eventData }));
    }

    $addEventHandler(eventType, handler) {
        let event, element, handlerFunction;
        const { searchForm, toggleLocationBtn } = this._elements;

        switch (eventType) {
            case SearchBoxEventType.SEARCH_CLICK:
                event = 'submit';
                element = searchForm;
                handlerFunction = (e) => { e.preventDefault(); handler(); };
                break;
            case SearchBoxEventType.INPUT_FOCUS_OUT:
                event = 'focusout';
                element = searchForm;
                handlerFunction = (e) => {
                    const elementId = e.target.id;
                    if (this._inputIdToProperty[elementId]) {
                        const eventData = {};
                        eventData[this._inputIdToProperty[elementId]] = true;
                        handler(eventData);
                    }
                };
                break;
            case SearchBoxEventType.TOGGLE_SOURCE_DESTINATION_CLICK:
                event = 'click';
                element = toggleLocationBtn;
                handlerFunction = (e) => { e.preventDefault(); handler(); };
                break;
            default:
                throw new InvalidArgumentError('eventType', eventType);
        }
        this._registerHandler(eventType, element, event, handlerFunction);
    }

    _registerHandler(eventType, element, event, handler) {
        if (!this._registeredHandlers.has(eventType)) {
            this._registeredHandlers.set(eventType, { element, event, handlers: [] });
        }
        this._registeredHandlers.get(eventType).handlers.push(handler);
        element.addEventListener(event, handler);
    }

    $removeAllEventHandlers() {
        this._registeredHandlers.forEach(({element, event, handlers}) => {
            handlers.forEach(handler => element.removeEventListener(event, handler));
        });
        this._registeredHandlers.clear();
    }
}

class SearchBoxEventType {
    static SEARCH_CLICK = "SearchClick";
    static INPUT_FOCUS_OUT = "InputFocusOut";
    static TOGGLE_SOURCE_DESTINATION_CLICK = "ToggleSourceDestinationClick";
}

export { SearchBoxView, SearchBoxEventType };