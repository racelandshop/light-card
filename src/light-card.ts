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
// import { styleMap } from "lit/directives/style-map";
// import { LightEntity } from "../../../data/light";
import { HomeAssistant, hasConfigOrEntityChanged, hasAction, ActionHandlerEvent, handleAction, LovelaceCardEditor, getLovelace, computeStateDomain, computeDomain } from "custom-card-helpers";
import "./editor";
import type { BoilerplateCardConfig } from "./types";
import { actionHandler } from "./action-handler-directive";
import { CARD_VERSION } from "./const";
import { localize } from "./localize/localize";

// const includeDomains = ["switch", "light"];

console.info(
  `%c  RACELAND-light-card \n%c  ${localize(
    "common.version"
  )} ${CARD_VERSION}    `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "light-card",
  name: "light-card",
  preview: true, //IMPORTANTE
  description: "A light card custom card",
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

    return { type: "custom:light-card", entity: foundEntities[0] || "" };
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
      show_icon: true,
      icon: "mdi:floor-lamp",
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

        <div></div>
        ${this.config.show_name
          ? html`
              <div tabindex="-1" class="name-div">${this.config.name}</div>
            `
          : ""}
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
    if (typeof this.config.icon === "string") {
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
    else if (Array.isArray(this.config.icon) === true) {

      return html`
      <svg viewBox="0 0 50 50" height="100%" width="50%">
  <path fill="#ffffff" d=${this.config.icon[0]} />
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
  d=${this.config.icon[1]} />

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

  private computeObjectId = (entityId: string): string =>
    entityId.substr(entityId.indexOf(".") + 1);

  private computeStateName = (stateObj: HassEntity): string =>
    stateObj.attributes.friendly_name === undefined
      ? this.computeObjectId(stateObj.entity_id).replace(/_/g, " ")
      : stateObj.attributes.friendly_name || "";

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
        align-items: center;
        text-align: center;
        padding: 4% 0;
        font-size: 1.2rem;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        justify-content: center;
        position: relative;
        background: rgba(120,120,120,0.7);
        color: white;
        border-radius: 25px;
        padding-left: 10%;
        padding-top: 15%;
        padding-bottom: 8%;

      }
      ha-card:focus {
        outline: solid;
        outline-color: white;
      }
      ha-icon {
        width: 50%;
        /* border: 2px solid #73AD21; */
        height: auto;
        padding: 0px 0px 0px 0px;
        color: var(--paper-item-icon-color, #44739e);
        --mdc-icon-size: 100%;
      }
      ha-icon + span {
        margin-top: 3%;
        margin-bottom: 10%;
      }
      ha-icon,
      span {
        outline: none;
      }
      .hassbut.state-on {
        background: rgba(255,255,255,0.7);
        color: black;
      }
      .hassbut {
        display: grid;
        grid-template-columns: 50% 50%;
      }
      .state-div {
        /* border: 2px solid #73AD21; */
        margin: 5% 0% 10% 0%;
        padding: 0px 0px 0px 0px;
        text-align: left;
        width: 100%;
      }
      .name-div {
        /* border: 2px solid #73AD21; */
        margin: 30% 25% 0% 0%;
        padding: 9% 0px 0px 0px;
        text-align: left;
        width: 100%;
      }
      .light-icon {
        transform: translate(0%, 0%);
      }
      .light-icon.state-on-ceiling-light {
        color: var(--paper-item-icon-active-color, #fdd835);
        animation: shake 0.9s;
        animation-iteration-count: 1;
      }
      .light-icon.state-on-floor-lamp {
        color: var(--paper-item-icon-active-color, #fdd835);
        animation: shaker 0.9s;
        animation-iteration-count: 1;
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
  // private _computeBrightness(stateObj: HassEntity | LightEntity): string {
  //   if (!stateObj.attributes.brightness || !this._config?.state_color) {
  //     return "";
  //   }
  //   const brightness = stateObj.attributes.brightness;
  //   return `brightness(${(brightness + 245) / 5}%)`;
  // }
  // private _computeColor(stateObj: HassEntity | LightEntity): string {
  //   if (this.config?.state_color && stateObj.attributes.rgb_color) {
  //     return `rgb(${stateObj.attributes.rgb_color.join(",")})`;
  //   }
  //   return "";
  // }
}
