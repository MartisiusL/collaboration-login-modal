import { EventCallbackFunction } from '@azure/msal-browser';

export declare class popupClient {
    protected isBrowserEnvironment: boolean;
    private eventCallbacks: Map<string, EventCallbackFunction>;
    constructor();
    acquireTokenPopup(redirect: string): Promise<boolean>;
}