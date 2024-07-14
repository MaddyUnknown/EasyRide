import {viewRouterBuilder} from './core/view-router.js';
import {SearchView} from './view/search-view.js';
import {HomeView} from './view/home-view.js';



viewRouterBuilder.registerRoute('/', '/html/home.html', HomeView);
viewRouterBuilder.registerRoute('/search', '/html/search.html', SearchView);


viewRouterBuilder.build();