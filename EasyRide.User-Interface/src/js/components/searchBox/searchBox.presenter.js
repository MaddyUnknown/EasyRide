import { InvalidArgumentError } from "../../modules/errorModule";
import { SearchBoxEventType, SearchBoxView } from "./searchBox.view";

class SearchBoxPresenter {
    constructor(view) {
        if(!(view instanceof SearchBoxView)) {
            throw new InvalidArgumentError('view', view);
        }
        this._view = view;
    }

    init() {
        this._view.$addEventHandler(SearchBoxEventType.SEARCH_CLICK, this._searchBusHandler.bind(this));
        this._view.$addEventHandler(SearchBoxEventType.INPUT_FOCUS_OUT, this._searchInputChangeHandler.bind(this));
        this._view.$addEventHandler(SearchBoxEventType.TOGGLE_SOURCE_DESTINATION_CLICK, this._toggleSourceDestination.bind(this));
    }

    destroy() {
        this._view.$removeAllEventHandlers();
    }

    _searchBusHandler() {
        const {boardingPoint, droppingPoint, boardingDate} = this._view.formData;

        if (this._validateFormData()) {
            this._view.$dispatchValidatedSearch({ boardingPoint, droppingPoint, boardingDate });
        } else {
            this._view.$animateErrorsShake();
        }
    }

    _searchInputChangeHandler(eventData) {
        this._validateFormData(eventData);
    }

    _toggleSourceDestination() {
        let { boardingPoint, droppingPoint, boardingDate } = this._view.formData;
        [boardingPoint, droppingPoint] = [droppingPoint, boardingPoint];
        this._view.formData = {boardingPoint, droppingPoint, boardingDate};
    }

    _validateFormData(checkFor = { boardingPoint: true, droppingPoint: true, boardingDate: true }) {
        const errorMessages = {};
        let isValid = true;

        const formData = this._view.formData;

        if (checkFor.boardingPoint && !formData.boardingPoint.trim()) {
            errorMessages.boardingPoint = 'Boarding Point cannot be empty or blank';
            isValid = false;
        } else if(checkFor.boardingPoint) {
            errorMessages.boardingPoint = '';
        }

        if (checkFor.droppingPoint && !formData.droppingPoint.trim()) {
            errorMessages.droppingPoint = 'Dropping Point cannot be empty or blank';
            isValid = false;
        } else if(checkFor.droppingPoint) {
            errorMessages.droppingPoint = '';
        }

        if (checkFor.boardingDate && !formData.boardingDate) {
            errorMessages.boardingDate = 'Invalid date specified';
            isValid = false;
        } else if(checkFor.boardingDate) {
            errorMessages.boardingDate = '';
        }

        this._view.$setErrorMessages(errorMessages);
        return isValid;
    }
}

export {SearchBoxPresenter};