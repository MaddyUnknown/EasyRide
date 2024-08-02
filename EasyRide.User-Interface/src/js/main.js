'use strict';

import {routerBuilder} from './modules/routeModule.js';
import { SearchPanelView } from './panels/search/search.view.js';
import { HomePanelView } from './panels/home/home.view.js';
import { MainPageView } from './page.view.js';

// Build router
routerBuilder.registerRoute('/', HomePanelView, { isDefault : true });
routerBuilder.registerRoute('/search', SearchPanelView);
routerBuilder.build();

//Initiate main page
const mainPage = new MainPageView();
mainPage.init();

document.addEventListener('beforeunload', (e) => {
    mainPage.destroy();
});