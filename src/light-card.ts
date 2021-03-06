/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { RippleHandlers } from "@material/mwc-ripple/ripple-handlers";
import { Ripple } from "@material/mwc-ripple";
import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup} from "lit";
import { HassEntity } from "home-assistant-js-websocket";
import { queryAsync } from "lit-element";
import { findEntities } from "./././find-entities";
import { customElement, property, state } from "lit/decorators";
import { ifDefined } from "lit/directives/if-defined";
import { classMap } from "lit/directives/class-map";
import { HomeAssistant, hasConfigOrEntityChanged, hasAction, ActionHandlerEvent, handleAction, LovelaceCardEditor, getLovelace, computeStateDomain } from "custom-card-helpers";
import "./editor";
import type { BoilerplateCardConfig } from "./types";
import { actionHandler } from "./action-handler-directive";
import { CARD_VERSION } from "./const";
import { localize } from "./localize/localize";


console.info(
  `%c  RACELAND-light-card \n%c  ${localize(
    "common.version"
  )} ${CARD_VERSION}    `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);


(window as any).customCards = (window as any).customCards || "", [];
(window as any).customCards.push({
  type: "light-card",
  name: "Luz",
  preview: true, //IMPORTANTE
  description: "Uma carta para a luz",
});
@customElement("light-card")
export class BoilerplateCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement("light-card-editor");
  }

  @queryAsync("mwc-ripple") private _ripple!: Promise<Ripple | null>;

  public static getStubConfig(
    hass: HomeAssistant,
    entities: string[],
    entitiesFallback: string[]
  ): BoilerplateCardConfig {
    const includeDomains = ["switch", "light"];
    const maxEntities = 1;
    const foundEntities = findEntities(
      hass,
      maxEntities,
      entities,
      entitiesFallback,
      includeDomains
    );
    return {
      type: "custom:light-card",
      entity: foundEntities[0] || "",
      "show_name": true,
      "show_state": true,
      "name": "Raceland",
      "show_preview": true,
      "show_icon": true,
      "icon": "mdi:ceiling-light"
    };
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: BoilerplateCardConfig;

  public setConfig(config: BoilerplateCardConfig): void {
    if (!config) {
      throw new Error(localize("common.invalidconfiguration"));
    }
    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      ...config,
      tap_action: {
        action: "toggle",
      },
    };
  }

  public translate_state(stateObj): string {
    if (
      ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) ===
      "on"
    ) {
      return localize("states.on");
    } else if (
      ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) ===
      "off"
    ) {
      return localize("states.off");
    } else if (
      ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) ===
      "unavailable"
    ) {
      return localize("states.unavailable");
    } else {
      return "";
    }
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }
    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected render(): TemplateResult | void {
    if (this.config.show_warning) {
      return this._showWarning(localize("common.show_warning"));
    }
    if (this.config.show_error) {
      return this._showError(localize("common.show_error"));
    }
    const stateObj = this.config.entity
      ? this.hass.states[this.config.entity]
      : undefined;

    return html`
      <ha-card
        class="hassbut ${classMap({
      "state-on":
        ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "on",
      "state-off":
        ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "off",
      })}"
        @action=${this._handleAction}
        @focus="${this.handleRippleFocus}"
        .actionHandler=${actionHandler({
      hasHold: hasAction(this.config.hold_action),
      hasDoubleClick: hasAction(this.config.double_tap_action),
    })}
        tabindex="0"
        .label=${`fan: ${this.config.entity || "No Entity Defined"}`}
      >
        ${this.config.show_icon
          ?this.renderIcon(stateObj)
          : ""}

        <div class="divibut"></div>
        ${this.config.show_name
          ? html`
              <div tabindex="-1" class="name-div">${this.config.name}</div>
            `
          : html`<div tabindex="-1" class="name-div"></div>`}
        <div></div>

        ${this.config.show_state
          ? html`
              <div tabindex="-1" class="state-div">
                ${this.translate_state(stateObj)}
                <div class="position"></div>
              </div>
            `
          : ""}
        <div></div>
      </ha-card>
    `;
  }

  private renderIcon(stateObj) {
    if (this.config.icon.split(":")[0] == "mdi") {
      return html`
      <ha-icon
      class="light-icon ${classMap({
        "state-on-ceiling-light":
          ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "on" && this.config.icon === "mdi:ceiling-light",
        "state-on-floor-lamp":
          ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "on" && this.config.icon === "mdi:floor-lamp",
        "state-off":
          ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "off",
        "state-unavailable":
          ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "unavailable",
      })}"
      tabindex="-1"
      data-domain=${ifDefined(
        this.config.state_color && stateObj
          ? computeStateDomain(stateObj)
          : undefined
      )}
      data-state=${ifDefined(
        stateObj ? this.computeActiveState(stateObj) : undefined
      )}
      .icon=${this.config.icon}
    ></ha-icon>`
    }

    else {
      return html`
        <svg class="svgicon" viewBox="0 0 50 50" height="75%" width="65%">
          <path fill="#d3d3d3" d=${this.config?.icon.split(":")[0]} />
          <path class=${classMap({
            "state-on-light-icon":
                ifDefined(stateObj? this.computeActiveState(stateObj) : undefined) === "on",
              "state-off":
              ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "off",
            "state-unavailable":
              ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "unavailable",
          }
              )
          }
        d=${this.config.icon.split(":")[1]} />

        </svg>`
    }
    return ""
  }

  private computeActiveState = (stateObj: HassEntity): string => {
    const domain = stateObj.entity_id.split(".")[0];
    let state = stateObj.state;
    if (domain === "climate") {
      state = stateObj.attributes.hvac_action;
    }
    return state;
  };

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
  }

  private _showWarning(warning: string): TemplateResult {
    return html` <hui-warning>${warning}</hui-warning> `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement("hui-error-card");
    errorCard.setConfig({
      type: "error",
      error,
      origConfig: this.config,
    });
    return html` ${errorCard} `;
  }

  private _rippleHandlers: RippleHandlers = new RippleHandlers(() => {
    return this._ripple;
  });

  private handleRippleFocus() {
    this._rippleHandlers.startFocus();
  }
  static get styles(): CSSResultGroup {
    return css`
      ha-card {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: left;
        text-align: left;
        padding: 10% 10% 10% 10%;
        font-size: 18px;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        justify-content: center;
        position: relative;
        background: var(--card-color-background, rgba(53,53,53,0.9));
        color: var(--card-color-text, white);
        border-radius: 25px;
        overflow: hidden;
      }

      ha-icon {
        width: 70%;
        height: 80%;
        padding-bottom: 15px;
        margin: 0% 0% 0% 0%;
        color: var(--paper-item-icon-color, #fdd835);
        --mdc-icon-size: 100%;
      }

      ha-icon + span {
        text-align: left;
      }
      .state {
        margin: 0% 50% 5% 0%;
        padding: 0% 100% 10% 0%;
        text-align: left;
      }

      span {
        margin: 5% 50% 1% 0%;
        padding: 0% 100% 1% 0%;
      }

      ha-icon,
      span {
        outline: none;
      }

      .hassbut.state-on {
        text-align: left;
      }

      .hassbut.state-off {
        text-align: left;
      }

      .divibut{
        padding-bottom: 0%;
        margin-bottom: 0%;
      }

      .hassbut {
        display: grid;
        grid-template-columns: 50% 50%;
      }

      .state-div {
        padding: 0% 100% 10% 0%;
        align-items: left;
      }

      .name-div {
        padding: 0% 100% 1% 0%;
        align-items: left;
      }

      .svgicon{
        padding: 5% 0% 20% 0%;
        max-width: 88px;
      }

      .light-icon {
        transform: translate(0%, 0%);
      }

      .light-icon.state-on-ceiling-light {
        color: var(--paper-item-icon-active-color, #fdd835);
      }

      .light-icon.state-on-floor-lamp {
        color: var(--paper-item-icon-active-color, #fdd835);
      }

      .state-on-light-icon {
        fill: var(--paper-item-icon-active-color, #fdd835);
        animation: shakerd 0.8s;
        transform-origin: center;
      }

      .state-on-light-lamp {
        fill: var(--paper-item-icon-active-color, #fdd835);
        animation: shakerdl 0.8s;
        transform-origin: center;
      }

      .light-icon.state-unavailable {
        color: var(--state-icon-unavailable-color, #bdbdbd);
      }

      @keyframes shake {
        0% { transform: rotate(0deg); }
        10% { transform: rotate(25deg); }
        20% { transform: rotate(0deg); }
        30% { transform: rotate(-25deg); }
        40% { transform: rotate(0deg); }
        50% { transform: rotate(25deg); }
        60% { transform: rotate(0deg); }
        70% { transform: rotate(-25deg); }
        80% { transform: rotate(0deg); }
        90% { transform: rotate(25deg); }
        100% { transform: rotate(0deg); }
      }

      @keyframes shaker {
        0% { transform: translate(0px); }
        25% { transform: translate(10px); }
        50% { transform: translate(0px); }
        75% { transform: translate(10px); }
        100% { transform: translate(0px); }
      }

      @keyframes shakerd {
        0% { transform: scale(0.85); }
        20% { transform: scale(1.1); }
        40% { transform: scale(0.95); }
        60% { transform: scale(1.03); }
        80% { transform: scale(0.97); }
        100% { transform: scale(1); }
      }

      @keyframes shakerdl {
        0% { transform: scale(0.85); }
        20% { transform: scale(1.1); }
        40% { transform: scale(0.95); }
        60% { transform: scale(1.03); }
        80% { transform: scale(0.97); }
        100% { transform: scale(1); }
      }

      .state {
        font-size: 0.9rem;
        color: var(--secondary-text-color);
      }
    `;
  }
}
