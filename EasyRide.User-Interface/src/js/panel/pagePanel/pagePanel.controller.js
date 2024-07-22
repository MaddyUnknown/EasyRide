import {PagePanelView} from './pagePanel.view';

const PAGE_CONTROLLER = 'PAGE-COMPONENT';
const EMPTY_TEMPLATE = '';

class PagePanelController {
    constructor() {
        this._pagePanelView = new PagePanelView();
        this._activePage = null;
    }


    setPage(pageControllerClass) {
        if(pageControllerClass?.$TYPE !== PAGE_CONTROLLER) {
            throw new Error(`'PageControllerClass' is not a valid page component`);
        } else if(pageControllerClass.$PAGE_TEMPLATE === EMPTY_TEMPLATE) {
            throw new Error(`'PageControllerClass' has not page template configured`);
        }

        if(this._activePage !== null) {
            this._activePage.destroy();
        }

        this._pagePanelView.setPageHTML(pageControllerClass.$PAGE_TEMPLATE);
        
        const controller = new pageControllerClass();
        controller.init();

        this._activePage = controller;
    }
}

const pagePanelController = new PagePanelController();

export {pagePanelController}