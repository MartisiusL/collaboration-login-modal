"use strict";
var MsalBrowser = require('@azure/msal-browser');
var PopupUtils = require("./PopupUtils");
var PopupHandler = require("./PopupHandler");

class PopupClient {
  acquireTokenPopup(redirect) {
    const popupName = 'loginPopup';
    const popup = PopupUtils.openSizedPopup('about:blank', popupName);
    return this.acquireTokenPopupAsync(popupName, redirect, popup);
  }

  async acquireTokenPopupAsync(
    popupName,
    redirectUrl,
    popup
  ) {
    this.emitEvent(MsalBrowser.EventType.LOGIN_START, MsalBrowser.InteractionType.Popup);
    try {
      // Create popup interaction handler.
      const interactionHandler = new PopupHandler();

      // Show the UI once the url has been created. Get the window handle for the popup.
      const popupParameters = {
        popup,
        popupName,
      };
      const popupWindow = interactionHandler.initiateAuthRequest(
        redirectUrl,
        popupParameters
      );
      this.emitEvent(
        MsalBrowser.EventType.POPUP_OPENED,
        MsalBrowser.InteractionType.Popup,
        { popupWindow },
        null
      );
      // Monitor the window for the hash. Return the string value and close the popup when the hash is received. Default timeout is 60 seconds.
      const isLoggingIn = await interactionHandler.monitorPopupForHash(
        popupWindow
      );
      if (isLoggingIn) {
        this.emitEvent(MsalBrowser.EventType.LOGIN_SUCCESS, MsalBrowser.InteractionType.Popup);
        return true;
      }
      return false;
    } catch (e) {
      this.emitEvent(MsalBrowser.EventType.LOGIN_FAILURE, MsalBrowser.InteractionType.Popup, null, e);
      if (popup) {
        // Close the synchronous popup if an error is thrown before the window unload event is registered
        popup.close();
      }
      throw e;
    }
  }

  emitEvent(
    eventType,
    interactionType,
    payload,
    error
  ) {
    var isBrowserEnvironment = typeof window !== 'undefined';
    var eventCallbacks = new Map();
    if (isBrowserEnvironment) {
      const message = {
        eventType: eventType,
        interactionType: interactionType || null,
        payload: payload || null,
        error: error || null,
        timestamp: Date.now(),
      };

      eventCallbacks.forEach(
        (callback) => {
          callback.apply(null, [message]);
        }
      );
    }
  }
}
module.exports = PopupClient;