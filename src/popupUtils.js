import { BrowserAuthError } from '@azure/msal-browser';
import { Constants, StringUtils } from '@azure/msal-common';

export class PopupUtils {
  constructor() {
    // Properly sets this reference for the unload event.
    this.unloadWindow = this.unloadWindow.bind(this);
  }

  /**
   * @hidden
   *
   * Configures popup window for login.
   *
   * @param urlNavigate
   * @param title
   * @param popUpWidth
   * @param popUpHeight
   * @ignore
   * @hidden
   */
  openPopup(
    urlNavigate,
    popupName,
    popup
  ) {
    try {
      let popupWindow;
      // Popup window passed in, setting url to navigate to
      if (popup) {
        popupWindow = popup;
        popupWindow.location.assign(urlNavigate);
      } else if (typeof popup === 'undefined') {
        // Popup will be undefined if it was not passed in
        popupWindow = PopupUtils.openSizedPopup(urlNavigate, popupName);
      }

      // Popup will be null if popups are blocked
      if (!popupWindow) {
        throw BrowserAuthError.createEmptyWindowCreatedError();
      }
      if (popupWindow.focus) {
        popupWindow.focus();
      }
      this.currentWindow = popupWindow;
      window.addEventListener('beforeunload', this.unloadWindow);

      return popupWindow;
    } catch (e) {
      throw BrowserAuthError.createPopupWindowError(e.toString());
    }
  }

  static openSizedPopup(urlNavigate, popupName) {
    const POPUP_WIDTH = 483;
    const POPUP_HEIGHT = 600;
    /**
     * adding winLeft and winTop to account for dual monitor
     * using screenLeft and screenTop for IE8 and earlier
     */
    const winLeft = window.screenLeft ? window.screenLeft : window.screenX;
    const winTop = window.screenTop ? window.screenTop : window.screenY;
    /**
     * window.innerWidth displays browser window"s height and width excluding toolbars
     * using document.documentElement.clientWidth for IE8 and earlier
     */
    const width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    const height =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;
    const left = Math.max(0, width / 2 - POPUP_WIDTH / 2 + winLeft);
    const top = Math.max(0, height / 2 - POPUP_HEIGHT / 2 + winTop);
    return window.open(
      urlNavigate,
      popupName,
      `width=${POPUP_WIDTH}, height=${POPUP_HEIGHT}, top=${top}, left=${left}, scrollbars=yes`
    );
  }

  /**
   * Event callback to unload main window.
   */
  unloadWindow(e) {
    if (this.currentWindow) {
      this.currentWindow.close();
    }
    // Guarantees browser unload will happen, so no other errors will be thrown.
    e.preventDefault();
  }

  /**
   * Closes popup, removes any state vars created during popup calls.
   * @param popupWindow
   */
  cleanPopup(popupWindow) {
    if (popupWindow) {
      // Close window.
      popupWindow.close();
    }
    // Remove window unload function
    window.removeEventListener('beforeunload', this.unloadWindow);
  }

  /**
   * Monitors a window until it loads a url with the same origin.
   * @param popupWindow - window that is being monitored
   */
  monitorPopupForSameOrigin(popupWindow) {
    const POLL_INTERVAL_MS = 50;
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(() => {
        if (popupWindow.closed) {
          // Window is closed
          this.cleanPopup();
          clearInterval(intervalId);
          reject(BrowserAuthError.createUserCancelledError());
          return;
        }
        let href = Constants.EMPTY_STRING;
        try {
          /*
           * Will throw if cross origin,
           * which should be caught and ignored
           * since we need the interval to keep running while on STS UI.
           */
          href = popupWindow.location.href;
        } catch (e) {
          console.error(e);
        }

        // Don't process blank pages or cross domain
        if (StringUtils.isEmpty(href) || href === 'about:blank') {
          return;
        }

        clearInterval(intervalId);
        resolve();
      }, POLL_INTERVAL_MS);
    });
  }
}
