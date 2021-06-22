import { PopupUtils } from './popupUtils';

export type PopupParams = {
  popup?: Window | null;
  popupName: string;
};

export class PopupHandler {
  private popupUtils: PopupUtils;

  constructor();
  initiateAuthRequest(requestUrl: string, params: PopupParams): Window;
  monitorPopupForHash(popupWindow: Window): Promise<boolean>;
}
