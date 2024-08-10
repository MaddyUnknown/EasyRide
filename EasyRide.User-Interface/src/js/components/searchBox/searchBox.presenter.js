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
        this._boundSearchBusHandler = this.searchBusHandler.bind(this);
        this._boundSearchInputChangeHandler = this.searchInputChangeHandler.bind(this);
        this._boundToggleSourceDestinationHandler = this.toggleSourceDestination.bind(this);


        this._view.addEventHandler('search', this._boundSearchBusHandler);
        this._view.addEventHandler('input-focus-out', this._boundSearchInputChangeHandler);
        this._view.addEventHandler('toggle-button-click', this._boundToggleSourceDestinationHandler);
    }

    destroy() {
        this._view.removeEventHandler('search', this._boundSearchBusHandler);
        this._view.removeEventHandler('input-focus-out', this._boundSearchInputChangeHandler);
        this._view.removeEventHandler('toggle-button-click', this._boundToggleSourceDestinationHandler);

        this._boundSearchBusHandler = this._boundSearchInputChangeHandler = this._boundToggleSourceDestinationHandler = undefined;
    }

    searchBusHandler() {
        const {boardingPoint, droppingPoint, boardingDate} = this._view.searchData;

        if (this._validateFormData()) {
            this._view.dispatchValidatedSearch({ boardingPoint, droppingPoint, boardingDate });
        } else {
            this._view.animateErrorsShake();
        }
    }

    searchInputChangeHandler(eventData) {
        this._validateFormData(eventData);
    }

    toggleSourceDestination() {
        let { boardingPoint, droppingPoint, boardingDate } = this._view.searchData;
        [boardingPoint, droppingPoint] = [droppingPoint, boardingPoint];
        this._view.searchData = {boardingPoint, droppingPoint, boardingDate};
    }

    _validateFormData(checkFor = { boardingPoint: true, droppingPoint: true, boardingDate: true }) {
        const errorMessages = {};
        let isValid = true;

        const searchData = this._view.searchData;

        if (checkFor.boardingPoint && !searchData.boardingPoint.trim()) {
            errorMessages.boardingPoint = 'Boarding Point cannot be empty or blank';
            isValid = false;
        } else if(checkFor.boardingPoint) {
            errorMessages.boardingPoint = '';
        }

        if (checkFor.droppingPoint && !searchData.droppingPoint.trim()) {
            errorMessages.droppingPoint = 'Dropping Point cannot be empty or blank';
            isValid = false;
        } else if(checkFor.droppingPoint) {
            errorMessages.droppingPoint = '';
        }

        if (checkFor.boardingDate && !searchData.boardingDate) {
            errorMessages.boardingDate = 'Invalid date specified';
            isValid = false;
        } else if(checkFor.boardingDate) {
            errorMessages.boardingDate = '';
        }

        this._view.setErrorMessages(errorMessages);
        return isValid;
    }
}

export {SearchBoxPresenter};