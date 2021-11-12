/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import { LitElement, html, TemplateResult, css, CSSResultGroup } from "lit";
import { HomeAssistant, fireEvent, LovelaceCardEditor, ActionConfig} from "custom-card-helpers";
import { BoilerplateCardConfig, EditorTarget } from "./types";
import { customElement, property, state } from "lit/decorators";

const lamp_icon_botton = "M27.4 47.3h-4.9s-.7.1-.7.8.4.9.7.9h4.9c.3 0 .7-.1.7-.9s-.7-.8-.7-.8zm3.3-2.9H19.3s-.8 0-.8.8.6.9.8.9h11.5c.2 0 .8-.1.8-.9-.1-.8-.9-.8-.9-.8zm0-3H19.3s-.8 0-.8.8.6.9.8.9h11.5c.2 0 .8-.1.8-.9-.1-.8-.9-.8-.9-.8zm0-2.9H19.3s-.8 0-.8.8.6.9.8.9h11.5c.2 0 .8-.1.8-.9s-.9-.8-.9-.8zm5.2-23.2c-3.3-5.3-7-5.6-10.9-5.6-3.8 0-8.4.4-10.9 5.6-.1.1-.1.3.1.7.4.8 3.3 7.2 3.2 18.8 0 1.1-.1 1.6 0 1.7 0 .1 0 .7 1.1.7h13c1 0 1-.5 1.1-.7v-1.7c-.1-11.6 2.8-18 3.2-18.8.1-.4.1-.5.1-.7";
const lamp_icon_top = "M14.1 15.3c3.4-.3 7-.4 10.9-.4 3.8 0 7.5.2 10.9.4.4-.4.7-.8.9-1.1C39 8.5 38.9 6.5 38.9 6c-.2-4.4-8.4-5-12.1-5h0-3.4c-3.7 0-12 .5-12.1 5 0 .5-.1 2.5 2.1 8.2 0 .3.3.8.7 1.1z";
const new_lamp_icon_top = "M38.1 20L35.7 3.8c-.3-1.9-.4-1.7-.6-2-.9-.6-2.3-.7-2.3-.7H17.4s-1.4 0-2.3.7c-.2.3-.3.1-.6 2C14 5.7 11.9 20 11.9 20s5.8.3 13.4.3h0c7.3 0 12.8-.3 12.8-.3z";
const new_lamp_icon_botton = "M26.5 21.8l3.8-6.1H19.7l3.8 6.1c-5 .7-6.3 5.8-5.7 10.2.7 5.1 3.2 10.1 5.7 14.4H19v2.5h11.8v-2.5h-4.5C29 42 31.4 37 32.1 32c.6-4.4-.6-9.4-5.6-10.2zm3.1 9.1c-.3 4.3-2.3 8.7-4.4 12.4l-.2.1v.1-.1c-1.8-3-3.3-6.4-4.1-9.7-.7-3.1-1-7.2 2.7-8.4 1.4-.5 3.1-.1 4.2.8 1.6 1 1.8 3 1.8 4.8z";

const includeDomains = ["switch", "light"];
@customElement("light-card-editor")
export class BoilerplateCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: BoilerplateCardConfig;
  @property() public icon_value?: string;
  @state() private _toggle?: boolean;
  @state() private _helpers?: any;
  private _initialized = false;

  public setConfig(config: BoilerplateCardConfig): void {
    this._config = config;
    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }
    return true;
  }

  get _name(): string {
    return this._config?.name || "";
  }

  get _show_name(): boolean {
    return this._config?.show_name ?? true;
  }

  get _show_state(): boolean {
    return this._config?.show_state ?? true;
  }

  get _entity(): string {
    return this._config?.entity || "";
  }

  get _show_warning(): boolean {
    return this._config?.show_warning || false;
  }

  get _show_error(): boolean {
    return this._config?.show_error || false;
  }

  get _tap_action(): ActionConfig {
    return this._config?.tap_action || { action: "more-info" };
  }

  get _hold_action(): ActionConfig {
    return this._config?.hold_action || { action: "none" };
  }

  get _double_tap_action(): ActionConfig {
    return this._config?.double_tap_action || { action: "none" };
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }
    this._helpers.importMoreInfoControl("climate");
    const entities = Object.keys(this.hass.states).filter(
      (eid) => eid.substr(0, eid.indexOf(".")) === "switch"
    );

    return html`
      <div class="card-config">
        <div class="option" .option=${"required"}>
          <ha-entity-picker
            .label="${this.hass.localize("ui.panel.lovelace.editor.card.generic.entity")} (${this.hass.localize("ui.panel.lovelace.editor.card.config.optional")})"
            .hass=${this.hass}
            .value=${this._entity}
            .configValue=${"entity"}
            .includeDomains=${includeDomains}
            @value-changed=${this._valueChanged}
            allow-custom-entity>
          </ha-entity-picker>

      <div class="side-by-side">
          <paper-input
            .label="${this.hass.localize("ui.panel.lovelace.editor.card.generic.name")} (${this.hass.localize("ui.panel.lovelace.editor.card.config.optional")})"
            .value=${this._name}
            .configValue=${"name"}
            @value-changed=${this._valueChanged}>
          </paper-input>
      </div class="side-by-side">

      <div class="div-options">
          <ha-formfield
            .label=${this.hass.localize("ui.panel.lovelace.editor.card.generic.show_name")}
            .dir=${this.dir}>
          <ha-switch
            .checked=${this._show_name !== false}
            .configValue=${"show_name"}
            @change=${this._change}>
          </ha-switch>
          </ha-formfield>Mostrar nome?

          <ha-formfield
            .label=${this.hass.localize("ui.panel.lovelace.editor.card.generic.show_state")}
            .dir=${this.dir}>
          <ha-switch
            .checked=${this._show_state !== false}
            .configValue=${"show_state"}
            @change=${this._change}>
          </ha-switch>
          </ha-formfield>Mostrar estado?
          <div>

          </div>
          <paper-input-label-8>Escolha o icon: </paper-input-label-8>
        <paper-dropdown-menu>
          <paper-listbox slot="dropdown-content"
            attr-for-selected="value"
            .configValue=${"icon"}
            selected='1'
            @iron-select=${this._changed_icon}>
            ${['mdi:ceiling-light', 'mdi:floor-lamp']
                .sort()
                .map(
                  (icon) =>
                    html` <paper-item value=${icon}><ha-icon .icon=${icon}></ha-icon>${icon.split(":", )[1]}</paper-item>`)}

          <paper-item .value=${[lamp_icon_botton, lamp_icon_top]}>
              <svg viewBox="0 0 50 50" height="24" width="24" >
              <path fill="#ffffff" d="M27.4 47.3h-4.9s-.7.1-.7.8.4.9.7.9h4.9c.3 0 .7-.1.7-.9s-.7-.8-.7-.8zm3.3-2.9H19.3s-.8 0-.8.8.6.9.8.9h11.5c.2 0 .8-.1.8-.9-.1-.8-.9-.8-.9-.8zm0-3H19.3s-.8 0-.8.8.6.9.8.9h11.5c.2 0 .8-.1.8-.9-.1-.8-.9-.8-.9-.8zm0-2.9H19.3s-.8 0-.8.8.6.9.8.9h11.5c.2 0 .8-.1.8-.9s-.9-.8-.9-.8zm5.2-23.2c-3.3-5.3-7-5.6-10.9-5.6-3.8 0-8.4.4-10.9 5.6-.1.1-.1.3.1.7.4.8 3.3 7.2 3.2 18.8 0 1.1-.1 1.6 0 1.7 0 .1 0 .7 1.1.7h13c1 0 1-.5 1.1-.7v-1.7c-.1-11.6 2.8-18 3.2-18.8.1-.4.1-.5.1-.7"/>
              <path d="M14.1 15.3c3.4-.3 7-.4 10.9-.4 3.8 0 7.5.2 10.9.4.4-.4.7-.8.9-1.1C39 8.5 38.9 6.5 38.9 6c-.2-4.4-8.4-5-12.1-5h0-3.4c-3.7 0-12 .5-12.1 5 0 .5-.1 2.5 2.1 8.2 0 .3.3.8.7 1.1z"/>
              </svg>Raceland Lâmpada
          </paper-item>

          <paper-item .value=${[new_lamp_icon_botton, new_lamp_icon_top]}>
              <svg viewBox="0 0 50 50" height="24" width="24" >
              <path fill="#000000" d="M38.1 20L35.7 3.8c-.3-1.9-.4-1.7-.6-2-.9-.6-2.3-.7-2.3-.7H17.4s-1.4 0-2.3.7c-.2.3-.3.1-.6 2C14 5.7 11.9 20 11.9 20s5.8.3 13.4.3h0c7.3 0 12.8-.3 12.8-.3z"/>
              <path fill="#ffffff" d="M26.5 21.8l3.8-6.1H19.7l3.8 6.1c-5 .7-6.3 5.8-5.7 10.2.7 5.1 3.2 10.1 5.7 14.4H19v2.5h11.8v-2.5h-4.5C29 42 31.4 37 32.1 32c.6-4.4-.6-9.4-5.6-10.2zm3.1 9.1c-.3 4.3-2.3 8.7-4.4 12.4l-.2.1v.1-.1c-1.8-3-3.3-6.4-4.1-9.7-.7-3.1-1-7.2 2.7-8.4 1.4-.5 3.1-.1 4.2.8 1.6 1 1.8 3 1.8 4.8z"/>
              </svg>Raceland Candeeiro
          </paper-item>

          </paper-listbox>
        </paper-dropdown-menu>
        </div>
    </div>
    </div>
    `;
  }

  private _change(ev: Event): void {
  if (!this._config || !this.hass) {
    return;
  }
  const target = ev.target! as EditorTarget;
  const value = target.checked;

  if (this[`_${target.configValue}`] === value) {
    return;
  }

  fireEvent(this, "config-changed", {
    config: {
      ...this._config,
      [target.configValue!]: value,
    },
  });
  }

  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === "") {
        const tmpConfig = { ...this._config };
        delete tmpConfig[target.configValue];
        this._config = tmpConfig;
      } else {
        this._config = {
          ...this._config,
          [target.configValue]:
            target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }

  private _changed_icon(ev): void {
    if (!this.hass || ev.target.selected === "") {
      return;
    }
    this._config = {
      ...this._config, [ev.target.configValue]: ev.target.selected, "type": 'custom:light-card'
    }
    fireEvent(this, "config-changed", { config: this._config });
  }

  static get styles(): CSSResultGroup {
    return css`
      .option {
        padding: 4px 0px;
        cursor: pointer;
      }
      .row {
        display: flex;
        margin-bottom: -14px;
        pointer-events: none;
      }
      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }
      .secondary {
        padding-left: 40px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .values {
        padding-left: 16px;
        background: var(--secondary-background-color);
        display: grid;
      }
      ha-formfield {
        padding: 0px 10px 0px 20px;
        max-width: 211px;
      }
      .div-options {
        padding: 10px 0px 0px 0px;
      }
    `;
  }
}
