import { SelectBase } from "@material/mwc-select/mwc-select-base";
import { styles } from "@material/mwc-select/mwc-select.css";
import { html, nothing, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { debounce } from "./utils/debouce";
import { nextRender } from "./utils/render-status";

@customElement("icon-select")
export class IconSelect extends SelectBase {

  protected renderLeadingIcon() {
    if (!this.value) {
        return nothing;
    }

    if (this.value.split(":")[0] == "mdi") {
      return html`<span class="mdc-select__icon"><ha-icon .icon=${this.value}></ha-icon></span>`;
    } else {
      return html`<span class="mdc-select__icon">
          <svg viewBox="0 0 50 50" height="24" width="24" >
            <path fill="#d3d3d3" d=${this.value.split(":")[0]}/>
            <path d=${this.value.split(":")[1]}/>
          </svg>
        </span>`;
      }
  }


    static styles = [
        styles,
        css`
          .mdc-select:not(.mdc-select--disabled) .mdc-select__icon {
            color: var(--secondary-text-color);
          }
          .mdc-select__anchor {
            width: 100%;
          }
          .mdc-select .mdc-select__anchor{
            padding-left: 40px;
          }
        `,
      ];

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
