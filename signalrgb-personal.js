export function Name() { return "signalrgb-personal"; }
export function VendorId() { return "marcelofrau"; }
export function ProductId() { return "yWT9ld4tf"; }
export function Publisher() { return "marcelofrau"; }
export function Size() { return [1,1]; }
export function DefaultPosition(){return [10, 100]; }
export function DefaultScale(){return 8.0}

export function ControllableParameters() {
	return [
		{"property":"shutdownColor", "group":"lighting", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"LightingMode", "group":"lighting", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced"], "default":"Canvas"},
		{"property":"forcedColor", "group":"lighting", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
	];
}

export function Initialize() {
    device.set_endpoint(0x01, 0x01, 0xFF42);
	//device.setImageFromUrl("https://assets.signalrgb.com/devices/default/usb-dongle.png");
	Corsair.SetMode("Software");
	Corsair.FetchDeviceInformation();
	fetchAndConfigureChildren();

    macroInputArray.setCallback((bitIdx, isPressed) => { return processMacroInputs(bitIdx, isPressed); });
}

function processMacroInputs(bitIdx, state) {
	device.set_endpoint(0x01, 0x01, 0xFF42);

	let deviceType;
	let buttonMapType;

	if (macroSubdeviceID === 0) {
		deviceType = wiredDevice?.keymapType;
		buttonMapType = wiredDevice?.buttonMap;
	} else {
		deviceType = BragiDongle?.children.get(macroSubdeviceID).keymapType;
		buttonMapType = BragiDongle?.children.get(macroSubdeviceID).buttonMap;
	}
	const keyName = CorsairLibrary.GetKeyMapping(bitIdx, deviceType, buttonMapType);

	if(keyName !== undefined && deviceType === "Mouse") {
        processMouseMacros(bitIdx, state, keyName);
	}
}

function processMouseMacros(bitIdx, state, keyName) {
	if(state) {
		switch(keyName) {
            case "Profile Switch":
                switchNextDPI();
                break;
            default:
                const eventData = {
                    "buttonCode": 0,
                    "released": !state,
                    "name":keyName
                };
                device.log(`bitIdx ${bitIdx} is state ${state}`);

                device.log(`Key ${keyName} is state ${state}`);
                mouse.sendEvent(eventData, "Button Press");
		}
	}
}

var vLedNames = [ "Logo", "DPI Indicator Light" ]; 
var vLedPositions = [ [1,1], [1,0] ];

function switchNextDPI() {
    device.log("switching to the next dpi");
	let nextStageIdx = ((DPIHandler.currentStageIdx) % DPIHandler.maxStageIdx + 1);
	DPIHandler.currentStageIdx = nextStageIdx;
	DPIHandler.update();

	device.notify("Switch DPI", "DPI Changed to: " + DPIHandler.getDpiForStage(DPIHandler.getCurrentStage()));
}

export function LedNames() {

}

export function LedPositions() {

}

export function Render() {

}

export function Shutdown() {

}

function hexToRgb(hex) {
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	let colors = [];
	colors[0] = parseInt(result[1], 16);
	colors[1] = parseInt(result[2], 16);
	colors[2] = parseInt(result[3], 16);
	return colors;
}

export function Validate(endpoint) {
	return endpoint.interface === 0 && endpoint.usage === 0 && endpoint.usage_page === 0;
}

export function Image() {
	return "";
}