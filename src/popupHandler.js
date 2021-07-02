"use strict";
var MsalBroswer = require('@azure/msal-browser');
var PopupUtils = require("./PopupUtils");

/**
 * This class implements the interaction handler base class for browsers. It is written specifically for handling
 * popup window scenarios. It includes functions for monitoring the popup window for a hash.
 */
class PopupHandler {
  constructor() {
    this.popupUtils = new PopupUtils();
  }

  /**
   * Opens a popup window with given request Url.
   * @param requestUrl
   */
  initiateAuthRequest(requestUrl, params) {
    // Check that request url is not empty.
    if (requestUrl) {
      // Open the popup window to requestUrl.
      return this.popupUtils.openPopup(
        requestUrl,
        params.popupName,
        params.popup
      );
    } else {
      // Throw error if request URL is empty.
      throw MsalBroswer.BrowserAuthError.createEmptyNavigationUriError();
    }
  }

  /**
   * Monitors a window until it loads a url with a known hash, or hits a specified timeout.
   * @param popupWindow - window that is being monitored
   * @param timeout - milliseconds until timeout
   */
  monitorPopupForHash(popupWindow) {
    return this.popupUtils.monitorPopupForSameOrigin(popupWindow).then(() => {
      MsalBroswer.BrowserUtils.clearHash(popupWindow);
      this.popupUtils.cleanPopup(popupWindow);
      return true;
    });
  }
}

module.exports = PopupHandler;