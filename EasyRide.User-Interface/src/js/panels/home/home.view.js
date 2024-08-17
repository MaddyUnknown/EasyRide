import html from "bundle-text:../../../html/home.html";

import { SearchBoxView } from "../../components/searchBox/searchBox.view";
import { PanelViewBase } from "../../modules/viewModule";
import { HomePanelPresenter } from "./home.presenter";
import { InvalidArgumentError } from "../../modules/errorModule";

class HomePanelView extends PanelViewBase {
    constructor(pageView) {
        super(pageView);
        this._presenter = new HomePanelPresenter(this);
        this.searchBox = new SearchBoxView();
    }

    static get $PANEL_TEMPLATE() {
        if(!HomePanelView._pageTemplate) {
            const template = document.createElement('template');
            const contentStr = html.trim();
            template.innerHTML = contentStr;
            HomePanelView._pageTemplate = template;
        }
        
        return HomePanelView._pageTemplate.content.cloneNode(true);
    }

    init() {
        this._container = document.querySelector('.panel--home');
        if(!this._container) {
            throw new InvalidArgumentError('HomePanelView', this._container);
        }

        this.pageView.header.setHeaderProperty({position : 'absolute', theme : 'dark'});
        this._initCarosel();
        this.searchBox.init();
        this._presenter.init();
    }

    _initCarosel() {
        this._boundCarousalBtnClickHandler = this._carousalButtonClickHandler.bind(this);
        this._boundCarousalDotClickHandler = this._carousalDotClickHandler.bind(this);

        this._carouselDotsContainer = this._container.querySelector('.container--carousel-dot');
        this._carouselItems = [...this._container.querySelectorAll('.container--carousel-items .carousel-item')];

        this._carouselItems.forEach(elem => {
            const dotElement = this._createCarousalDotElement(elem.dataset.index);
            this._carouselDotsContainer.appendChild(dotElement);
        })

        this._carouselBtns = {
            previous : this._container.querySelector('.contrainer--testimony-carousel .btn--testimony[data-action="previous"]'),
            next : this._container.querySelector('.contrainer--testimony-carousel .btn--testimony[data-action="next"]'),
        }

        this._carouselBtns.previous.addEventListener('click', this._boundCarousalBtnClickHandler);
        this._carouselBtns.next.addEventListener('click', this._boundCarousalBtnClickHandler);
        this._carouselDotsContainer.addEventListener('click', this._boundCarousalDotClickHandler);

        this._setCarousalIndex(0);
    }

    destroy() {
        this._presenter.destroy();

        this._carouselBtns.previous.removeEventListener('click', this._boundCarousalBtnClickHandler);
        this._carouselBtns.next.removeEventListener('click', this._boundCarousalBtnClickHandler);
        this._carouselDotsContainer.removeEventListener('click', this._boundCarousalDotClickHandler);

        this.searchBox.destroy();
        this.pageView.header.setHeaderProperty({position : 'unset', theme : 'default'});
        this._boundCarousalBtnClickHandler = undefined;
        this._boundCarousalDotClickHandler = undefined;
        this._carouselBtns = undefined;
        this._carouselDotsContainer = undefined;
        this._carouselItems = undefined;
        this._container = undefined;
    }

    _createCarousalDotElement(index) {
        const element = document.createElement('div');
        element.classList.add('carousal-dot');
        element.dataset.targetIndex = index;

        return element;
    }

    _setCarousalIndex(index) {
        let indexInt;
        if(!Number.isInteger(index)) {
            indexInt = Number.parseInt(index);
        } else {
            indexInt = index;
        }

        if(Number.isNaN(indexInt)) {
            throw new InvalidArgumentError('index', index);
        }

        // Transform slides to appropriate index
        for(const item of this._carouselItems) {
            const itemIndex = Number.parseInt(item.dataset.index);
            
            if(!Number.isNaN(itemIndex)) {
                item.style.transform = `translateX(${100*(itemIndex-indexInt)}%)`;
            } else {
                console.log(item.dataset.index);
            }
        }

        // Update target index of previous and next btn
        this._carouselBtns.previous.dataset.targetIndex = (this._carouselItems.length+indexInt-1)%(this._carouselItems.length);
        this._carouselBtns.next.dataset.targetIndex = (indexInt+1)%(this._carouselItems.length);

        // Make index dot active
        const currentActiveDot = this._carouselDotsContainer.querySelector('.carousal-dot.active');
        if(currentActiveDot) {
            currentActiveDot.classList.remove('active');
        }

        const newActiveDot = this._carouselDotsContainer.querySelector(`.carousal-dot[data-target-index="${indexInt}"]`);;
        if(newActiveDot) {
            newActiveDot.classList.add('active');
        }
    }

    _carousalButtonClickHandler(e) {
        const element = e.target.closest('.btn--testimony');
        if(element) {
            this._setCarousalIndex(element.dataset.targetIndex);
        }
    }

    _carousalDotClickHandler(e) {
        const element = e.target.closest('.carousal-dot');
        if(element) {
            this._setCarousalIndex(element.dataset.targetIndex);
        }
    }

}

export {HomePanelView};