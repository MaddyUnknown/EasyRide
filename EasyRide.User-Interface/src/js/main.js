'use strict';

import {routerBuilder} from './modules/routeModule.js';
import {SearchPageController} from './page/search/search.controller.js';
import {HomePageController} from './page/home/home.controller.js';
import {messageComponent} from './core/view.js';


routerBuilder.registerRoute('/', HomePageController, { isDefault : true });
routerBuilder.registerRoute('/search', SearchPageController);

// messageComponent.addSuccessMessage('Successfully Updated data');
// // // messageComponent.addMessage("Alone", "Testing", "");
// setTimeout(() => messageComponent.addErrorMessage('Error while updating data'), 1000);
// setTimeout(() => messageComponent.addWarningMessage('Validation error'), 2000);

routerBuilder.build();