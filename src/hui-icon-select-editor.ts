// import "@material/mwc-button";
// import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
// import "@polymer/paper-item/paper-item";
// import "@polymer/paper-listbox/paper-listbox";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { fireEvent, HomeAssistant } from "custom-card-helpers";

import { localize } from "./localize/localize";


@customElement("hui-icon-select-editor")
export class HuiIconSelectEditor extends LitElement {
  @property() public value?: string;

  @property() public label?: string;

  @property({ attribute: false }) public hass?: HomeAssistant;

  protected render(): TemplateResult {
    return html`
      <paper-dropdown-menu
        .label=${this.label ||
        `${localize(
          "ui.panel.lovelace.editor.card.generic.icon"
        )} (${localize(
          "ui.panel.lovelace.editor.card.config.optional"
        )})`}
        dynamic-align
      >
        <paper-listbox
          slot="dropdown-content"
          attr-for-selected="icon"
          @iron-select=${this._changed}
        >
          ${['mdi:ceiling-light', 'mdi:floor-lamp']
            .sort()
            .map(
              (icon) =>
                html` <paper-item icon=${icon}>${icon}</paper-item> `
            )}
        </paper-listbox>
      </paper-dropdown-menu>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      paper-dropdown-menu {
        width: 100%;
      }
      paper-item {
        cursor: pointer;
      }
    `;
  }

  private _changed(ev): void {
    if (!this.hass || ev.target.selected === "") {
      return;
    }
    this.value = ev.target.selected === "remove" ? "" : ev.target.selected;
    fireEvent(this, "value-changed", { value: this.value });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-icon-select-editor": HuiIconSelectEditor;
  }
}
