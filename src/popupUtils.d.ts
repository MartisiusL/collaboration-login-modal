export class PopupUtils {
    private currentWindow: Window | undefined;
    constructor();
    openPopup(
        urlNavigate: string,
        popupName: string,
        popup?: Window | null
      ): Window;
    static openSizedPopup(urlNavigate: string, popupName: string): Window | null;
    unloadWindow(e: Event): void;
    cleanPopup(popupWindow?: Window): void;
    monitorPopupForSameOrigin(popupWindow: Window): Promise<void>;
}