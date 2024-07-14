const VIEW_COMPONENT = "ViewComponent";
const EMPTY_VIEW = "<none>";

class ViewAccessor {

    getCurrentView() {
        if(!this._currentView) {
            return null;
        }
        return this._currentView;
    }

    renderViewForComponentClass(classFn, state, rootElement) {
        if(this._currentView) {
            this._currentView.destroy();
        }

        if(!classFn || classFn.$type !== VIEW_COMPONENT) {
            throw new Error(`Input : '${classFn?.name}' is not of type 'ViewComponent'`);
        }
        if(!classFn.$view || classFn.$view === "<none>") {
            throw new Error(`ViewComponent '${classFn.name}' is not assigned a view html`);
        }

        const viewPath = classFn.$view;

        fetch(viewPath)
        .then(res => res.text())
        .then(html => {
            rootElement.innerHTML = html;
        })
        .then(() => {
            this._currentView = new classFn(state);
            this._currentView.init();
        })
        .catch(() => {
            console.log('Something went wrong in render method');
        });
    }
}

class ViewBase {
    constructor(state) {
    }

    init() {

    }

    destroy() {

    }
}

ViewBase.$type=VIEW_COMPONENT;
ViewBase.$view=EMPTY_VIEW;

const viewAccessor = new ViewAccessor();

export {ViewBase, viewAccessor};