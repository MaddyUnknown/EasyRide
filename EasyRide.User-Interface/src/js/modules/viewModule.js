import { InvalidArgumentError } from "./errorModule";

class ViewType {
    static COMPONENT = 'Component';
    static PANEL = 'Panel';
    static PAGE = 'Page';
}

class ViewBase {
    static $TYPE = ViewType.COMPONENT;

    $initateEventHandlerStore() {
        this._eventHandlerStore = new Map();
    }

    $clearEventHandlerStore() {
        this._eventHandlerStore.clear();
        this._eventHandlerStore = undefined;
    }

    $storeEventHandler(event, originalHandler, wrapperHandler) {
        if(!this._eventHandlerStore.has(event)) {
            this._eventHandlerStore.set(event, new Map());
        }

        this._eventHandlerStore.get(event).set(originalHandler, wrapperHandler);
    }

    $getStoredWrapperEventHandler(event, originalHandler = null) {
        if(originalHandler === null) {
            return this._eventHandlerStore.get(event);
        } else {
            return this._eventHandlerStore.get(event)?.get(originalHandler)
        }
    }

    $removeStoredEventHandler(event, originalHandler) {
        this._eventHandlerStore.get(event)?.delete(originalHandler);
    }

    init() {

    }

    destroy() {

    }
}

// Placeholder class acting as interface for the pages (root level component);
class PageViewBase extends ViewBase {
    static $TYPE = ViewType.PAGE;
    
}

class PanelViewBase extends ViewBase {
    static $TYPE = ViewType.PANEL;

    static get $PANEL_TEMPLATE() {
        return null;
    }

    constructor(pageView) {
        super();
        if(!(pageView instanceof PageViewBase)) {
            throw new InvalidArgumentError('view', pageView);
        }

        this.pageView = pageView;
    }
}

class MessageInfoComponent {
    constructor() {
        this._messageContainer = document.querySelector('.container--message');
        this._messageList = [];
        this._addCloseEventListner();
    }

    _addCloseEventListner() {
        this._messageContainer.addEventListener('click', (e) => {
            const closeBtn = e.target.closest('.btn--message-close')
            if(closeBtn) {
                const messageElement = e.target.closest('.message-card');
                this._removeMessageById(messageElement.dataset.id);
            }
        });
    }

    addSuccessMessage(message) {
        this.addMessage("Success", message, "success");
    }

    addErrorMessage(message) {
        this.addMessage("Error", message, "error");
    }

    addErrorMessageList(messageList) {
        this.addMessage("Error", `<ul>${messageList.map(x => `<li>${x}</li>`).join('')}</ul>`, "error");
    }

    addWarningMessage(message) {
        this.addMessage("Warning", message, "warning");
    }

    addMessage(title, message, type="success") {
        const messageElement = document.createElement('li');
        const id = String(Date.now());
        const iconName = this._getIconNameByMessageType(type);
        
        messageElement.classList.add(`message-card`);
        messageElement.classList.add(`message-card--${type}`);
        messageElement.classList.add('hidden-in');


        messageElement.setAttribute('data-id', id);

        messageElement.innerHTML = `
        <div class="container--message-icon">
            <ion-icon name="${iconName}"></ion-icon>
        </div>
        <div class="container--message-body">
            <div class="message-title">${title}</div>
            <div class="message-content">${message}</div>
        </div>
        <div class="container--message-close">
            <button class="btn--message-close">
                <ion-icon name="close-outline"></ion-icon>
            </button>
        </div>
        `

        this._messageList.push(messageElement);
        this._messageContainer.appendChild(messageElement);
        setTimeout(() => messageElement.classList.remove('hidden-in'));

        setTimeout(() => {
            this._removeMessageById(id);
        }, 3300);
    }

    _removeMessageById(id) {
        const index = this._messageList.findIndex(x => x.dataset.id === id);
        if(index !== -1) {
            const [element] = this._messageList.splice(index, 1);
            element.classList.add('hidden-out');
            setTimeout(() => {
                element.remove();
            }, 300);
        }
    }
    
    _getIconNameByMessageType(type) {
        switch(type) {
            case "success" : return "checkmark-circle-outline";
            case "warning" : return "alert-circle-outline";
            case "error" : return "close-circle-outline";
            default : return "information-circle-outline";
        }
    }
}

const messageInfoComponent = new MessageInfoComponent();

export { ViewType, ViewBase, PanelViewBase, PageViewBase, messageInfoComponent };