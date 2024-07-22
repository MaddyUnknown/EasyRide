import {PagePanelView} from './pagePanel.view';

const PAGE_CONTROLLER = 'PAGE-COMPONENT';
const EMPTY_TEMPLATE = '';

class PagePanelController {
    constructor() {
        this._pagePanelView = new PagePanelView();
    }


    setPage(pageControllerClass) {
        if(pageControllerClass?.$TYPE !== PAGE_CONTROLLER) {
            throw new Error(`'PageControllerClass' is not a valid page component`);
        } else if(pageControllerClass.$PAGE_TEMPLATE === EMPTY_TEMPLATE) {
            throw new Error(`'PageControllerClass' has not page template configured`);
        }

        this._pagePanelView.setPageHTML(pageControllerClass.$PAGE_TEMPLATE);
    }
}

const pagePanelController = new PagePanelController();

export {pagePanelController}