import { SelectBase } from "@material/mwc-select/mwc-select-base";
import { styles } from "@material/mwc-select/mwc-select.css";
import { html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { debounce } from "./utils/debouce";
import { nextRender } from "./utils/render-status";

@customElement("icon-select")
export class IconSelect extends SelectBase {

    protected renderLeadingIcon() {
        if (!this.value) {
            return nothing;
        }
        //return html`<span class="mdc-select__icon"><ha-icon .icon=${this.value}></ha-icon></span>`;
        return html`<span class="mdc-select__icon"><slot name="icon"></slot></span>`;
    }

    static styles = [styles];

    // static styles = [
    //     styles,
    //     css`
    //       .mdc-select:not(.mdc-select--disabled) .mdc-select__icon {
    //         color: var(--secondary-text-color);
    //       }
    //       .mdc-select__anchor {
    //         width: var(--ha-select-min-width, 200px);
    //       }
    //     `,
    //   ];

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener("translations-updated", this._translationsUpdated);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("translations-updated", this._translationsUpdated);
    }

    private _translationsUpdated = debounce(async () => {
        await nextRender();
        this.layoutOptions();
    }, 500);
}

declare global {
    interface HTMLElementTagNameMap {
        "icon-select": IconSelect;
    }
}
