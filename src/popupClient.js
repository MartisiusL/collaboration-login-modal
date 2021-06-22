"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

import {
    InteractionType,
    EventType
  } from '@azure/msal-browser';
  import { PopupUtils } from './popupUtils';
  import { PopupHandler } from './popupHandler';
  
class popupClient {
    constructor() {
      this.isBrowserEnvironment = typeof window !== 'undefined';
      this.eventCallbacks = new Map();
    }
  
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
      this.emitEvent(EventType.LOGIN_START, InteractionType.Popup);
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
  
    emitEvent(
      eventType,
      interactionType,
      payload,
      error
    ) {
      if (this.isBrowserEnvironment) {
        const message = {
          eventType: eventType,
          interactionType: interactionType || null,
          payload: payload || null,
          error: error || null,
          timestamp: Date.now(),
        };
  
        this.eventCallbacks.forEach(
          (callback) => {
            callback.apply(null, [message]);
          }
        );
      }
    }
  }
  
  module.exports.popupClient = popupClient;
  