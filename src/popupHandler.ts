import { StringUtils } from '@azure/msal-common';
import { BrowserAuthError, BrowserUtils } from '@azure/msal-browser';
import { PopupUtils } from './popupUtils';

export type PopupParams = {
  popup?: Window | null;
  popupName: string;
};

/**
 * This class implements the interaction handler base class for browsers. It is written specifically for handling
 * popup window scenarios. It includes functions for monitoring the popup window for a hash.
 */
export class PopupHandler {
  private popupUtils: PopupUtils;

  constructor() {
    this.popupUtils = new PopupUtils();
  }

  /**
   * Opens a popup window with given request Url.
   * @param requestUrl
   */
  initiateAuthRequest(requestUrl: string, params: PopupParams): Window {
    // Check that request url is not empty.
    if (!StringUtils.isEmpty(requestUrl)) {
      // Open the popup window to requestUrl.
      return this.popupUtils.openPopup(
        requestUrl,
        params.popupName,
        params.popup
      );
    } else {
      // Throw error if request URL is empty.
      throw BrowserAuthError.createEmptyNavigationUriError();
    }
  }

  /**
   * Monitors a window until it loads a url with a known hash, or hits a specified timeout.
   * @param popupWindow - window that is being monitored
   * @param timeout - milliseconds until timeout
   */
  monitorPopupForHash(popupWindow: Window): Promise<boolean> {
    return this.popupUtils.monitorPopupForSameOrigin(popupWindow).then(() => {
      BrowserUtils.clearHash(popupWindow);
      this.popupUtils.cleanPopup(popupWindow);
      return true;
    });
  }
}
