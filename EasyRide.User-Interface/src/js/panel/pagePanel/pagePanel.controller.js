import {router} from '../../modules/routeModule';

class PagePanelController {
    setComponent(componentClass, state = {}) {
        router.$ROUTER_CONTAINER.innerHTML = componentClass.$VIEW_TEMPLATE;
    }
}

const pagePanelController = new PagePanelController();

export {pagePanelController}