import {
  InteractionType,
  EventType,
  EventCallbackFunction,
  EventError,
  EventMessage,
  EventPayload,
} from '@azure/msal-browser';
import { PopupUtils } from './popupUtils';
import { PopupHandler, PopupParams } from './popupHandler';

export class popupClient {
  protected isBrowserEnvironment: boolean;
  private eventCallbacks: Map<string, EventCallbackFunction>;

  constructor() {
    this.isBrowserEnvironment = typeof window !== 'undefined';
    this.eventCallbacks = new Map();
  }

  acquireTokenPopup(redirect: string): Promise<boolean> {
    const popupName = 'loginPopup';
    const popup = PopupUtils.openSizedPopup('about:blank', popupName);
    return this.acquireTokenPopupAsync(popupName, redirect, popup);
  }

  private async acquireTokenPopupAsync(
    popupName: string,
    redirectUrl: string,
    popup?: Window | null
  ): Promise<boolean> {
    this.emitEvent(EventType.LOGIN_START, InteractionType.Popup);
    try {
      // Create popup interaction handler.
      const interactionHandler = new PopupHandler();

      // Show the UI once the url has been created. Get the window handle for the popup.
      const popupParameters: PopupParams = {
        popup,
        popupName,
      };
      const popupWindow: Window = interactionHandler.initiateAuthRequest(
        redirectUrl,
        popupParameters
      );
      this.emitEvent(
        EventType.POPUP_OPENED,
        InteractionType.Popup,
        { popupWindow },
        null
      );
      // Monitor the window for the hash. Return the string value and close the popup when the hash is received. Default timeout is 60 seconds.
      const isLoggingIn = await interactionHandler.monitorPopupForHash(
        popupWindow
      );
      if (isLoggingIn) {
        this.emitEvent(EventType.LOGIN_SUCCESS, InteractionType.Popup);
        return true;
      }
      return false;
    } catch (e) {
      this.emitEvent(EventType.LOGIN_FAILURE, InteractionType.Popup, null, e);
      if (popup) {
        // Close the synchronous popup if an error is thrown before the window unload event is registered
        popup.close();
      }
      throw e;
    }
  }

  protected emitEvent(
    eventType: EventType,
    interactionType?: InteractionType,
    payload?: EventPayload,
    error?: EventError
  ): void {
    if (this.isBrowserEnvironment) {
      const message: EventMessage = {
        eventType: eventType,
        interactionType: interactionType || null,
        payload: payload || null,
        error: error || null,
        timestamp: Date.now(),
      };

      this.eventCallbacks.forEach(
        (callback: EventCallbackFunction, callbackId: string) => {
          callback.apply(null, [message]);
        }
      );
    }
  }
}

module.exports.popupClient = popupClient;
