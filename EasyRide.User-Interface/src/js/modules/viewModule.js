const PAGE_CONTROLLER = 'PAGE-COMPONENT';
const EMPTY_TEMPLATE = '';

class PageControllerBase {
    static $TYPE = PAGE_CONTROLLER;
    static $PAGE_TEMPLATE = EMPTY_TEMPLATE;

    init() {

    }

    destroy() {

    }
}

export { PageControllerBase };