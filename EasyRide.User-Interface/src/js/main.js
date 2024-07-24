'use strict';

import {routerBuilder} from './modules/routeModule.js';
import {SearchPageController} from './page/search/search.controller.js';
import {HomePageController} from './page/home/home.controller.js';
import {messageInfoComponent} from './modules/viewModule.js';


routerBuilder.registerRoute('/', HomePageController, { isDefault : true });
routerBuilder.registerRoute('/search', SearchPageController);

// messageInfoComponent.addSuccessMessage('Successfully Updated data');
// // // messageInfoComponent.addMessage("Alone", "Testing", "");
// setTimeout(() => messageInfoComponent.addErrorMessage('Error while updating data'), 1000);
// setTimeout(() => messageInfoComponent.addWarningMessage('Validation error'), 2000);

routerBuilder.build();