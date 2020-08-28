declare function resetConfig(_data: any, input: any): void;
declare function countProperties(obj: any): number;
declare function showSuccessMessage(message: any): void;
declare function showErrorMessage(message: any): void;
declare function showMessage(type: any, message: any): void;
declare var profileDomain: string;
declare var profiles: any;
declare namespace TABS {
    namespace fixtures {
        const label: string;
        const tooltip: string;
    }
    namespace config {
        const label_1: string;
        export { label_1 as label };
        const tooltip_1: string;
        export { tooltip_1 as tooltip };
    }
}
declare var inputVersion: number;
declare namespace api {
    function doPost(path: any, data: any, method: any, callback: any): void;
    function executeAction(action: any, input: any, route: any): void;
    function proxyTo(val: any): void;
    function selectVariant(routeId: any, variantId: any): void;
    function selectValue(routeId: any, type: any, id: any, value: any): void;
    function globalInputChange(pluginId: any, id: any, value: any): void;
    function resetState(): void;
    function resetInput(): void;
    function loadProfile(profile: any): void;
    function getLocalProfileNames(): any[];
    function getLocalProfile(name: any): any;
    function saveLocalProfile(name: any): void;
    function deleteLocalProfile(profile: any): void;
    function toProfileData(): {};
}
declare var INPUT_TYPES: {};
declare var RouteStyleController: any;
declare var TipButton: any;
declare var RouteGroupMenu: any;
declare var TabPanel: any;
declare var RouteListPanel: any;
declare var AdminPage: any;
declare var Actions: any;
declare var Button: any;
declare namespace routeColors {
    const GET: string;
    const POST: string;
    const DELETE: string;
    const PATCH: string;
    const PUT: string;
}
declare var Route: any;
declare var Variant: any;
declare var InputItemWrapper: any;
declare var UndefinedInput: any;
declare var InputList: any;
declare var DisplaySelectorChoice: any;
declare var ConfigTab: any;
declare var Proxy: any;
declare var Message: any;
