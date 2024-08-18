import { InvalidArgumentError } from "../../modules/errorModule";
import { ViewBase } from "../../modules/viewModule";
import { HeaderPresenter } from "./header.presenter";
import lightLogoUrl from 'url:../../../img/logo-light.webp';
import darkLogoUrl from 'url:../../../img/logo-dark.webp';

class HeaderView extends ViewBase {

    static _DEFAULT_THEME = 'light';

    constructor() {
        super();
        this._presenter = new HeaderPresenter(this);
    }

    init() {
        this._container = document.querySelector('.component--header');
        if(!this._container) {
            throw new InvalidArgumentError('PageHeaderContainer', this._container);
        }
        
        this._logoMap = new Map(
            [
                ['dark', darkLogoUrl],
                ['light', lightLogoUrl]
            ]);

        this._initElements();
        this._applyTheme('default');
        this._presenter.init();
    }

    _initElements() {
        this._logoImage = this._container.querySelector('.header-logo');
        this._navLinks = [...this._container.querySelectorAll('.nav-link')];
    }

    destroy() {
        this._presenter.destroy();

        this._logoImage = undefined;
        this._navLinks = undefined;
        this._logoMap = undefined;
        this._container = undefined;
    }

    setHeaderProperty({ theme, position }) {
        if (theme) this._applyTheme(theme);
        if (position) this._setPosition(position);
    }

    _applyTheme(theme) {
        const newTheme = theme === 'default' ? HeaderView._DEFAULT_THEME : theme;

        if (!this._logoMap.has(newTheme)) {
            throw new InvalidArgumentError('themeName', `Theme '${newTheme}' not found`);
        }

        if (newTheme !== this._currentTheme) {
            this._currentTheme = newTheme;
            this._logoImage.src = this._logoMap.get(newTheme);
            this._toggleNavLinkTheme(newTheme === 'dark');
        }
    }

    _toggleNavLinkTheme(isDark) {
        this._navLinks.forEach(link => link.classList.toggle('dark', isDark));
    }

    _setPosition(position) {
        if (['absolute', 'unset'].includes(position)) {
            this._container.classList.toggle('absolute', position === 'absolute');
        } else {
            throw new InvalidArgumentError('position', `Invalid position '${position}'`);
        }
    }
}

export { HeaderView };