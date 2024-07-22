class PagePanelView {
    constructor() {
        this._router_container = document.querySelector($ROUTER_CONTAINER_SELECTOR);
    }

    setPageHTML(html) {
        this._router_container.innerHTML = html;
    }
}

const $ROUTER_CONTAINER_SELECTOR = "app-container";

export { PagePanelView, $ROUTER_CONTAINER_SELECTOR };