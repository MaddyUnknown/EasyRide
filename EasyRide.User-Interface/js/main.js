import {viewRouterBuilder} from './core/view-router.js';
import {SearchView} from './view/search-view.js';
import {HomeView} from './view/home-view.js';
import {messageComponent} from './core/view.js';


viewRouterBuilder.registerRoute('/', HomeView);
viewRouterBuilder.registerRoute('/search', SearchView);

// messageComponent.addSuccessMessage('Successfully Updated data');
// // // messageComponent.addMessage("Alone", "Testing", "");
// setTimeout(() => messageComponent.addErrorMessage('Error while updating data'), 1000);
// setTimeout(() => messageComponent.addWarningMessage('Validation error'), 2000);

viewRouterBuilder.build();