
SHORTCUT = {
    KeyP: { weight: 8.3, length: 45, width: 45, height: 14, extraCover: 300 }, //pyramid
    KeyL: { weight: 5.6, length: 48, width: 46, height: 7, extraCover: 200 }, //rome
    KeyN: { weight: 5.6, length: 48, width: 46, height: 7, extraCover: 200 }, // 1001 nights
    KeyX: { weight: 3.1, length: 46, width: 40, height: 8, extraCover: 200 }, // xiao ke ai
    KeyF: {} // just fill tracking notifications and save address
}

function simulateTextboxType(field, value) {
    if (field) {
        const cev = new Event('change');
        field.value = value;
        field.dispatchEvent(cev);
        const iev = new Event('input');
        field.value = value;
        field.dispatchEvent(iev);
    }
}
function simulateCheckboxType(field, value) {
    if (field) {
        const cev = new Event('change');
        field.checked = value;
        field.dispatchEvent(cev);
        const iev = new Event('click');
        field.checked = value;
        field.dispatchEvent(iev);
    }
}

function simulateOptionSelect(field, value) {
    if (field) {
        const cev = new Event('change');
        field.value = value;
        field.dispatchEvent(cev);
    }
}

document.addEventListener('keypress', event => {
    const pressedKey = event.code
    const altKey = event.altKey
    if (altKey && pressedKey in SHORTCUT) {
        // Send tracking notifications to this recipient (optional) 
        const trackEmail = document.querySelector("#recipientDetailsForm-tracking");
        simulateCheckboxType(trackEmail, true);
        // Save this address
        const saveAddress = document.querySelector("#recipientDetailsForm-save");
        simulateCheckboxType(saveAddress, true);

        const pacakgeType = document.querySelector("#parcelDetailsForm-domestic-packagingType");
        simulateOptionSelect(pacakgeType, "string:PKOWN");
        
        if (pressedKey != "f") {
            
            const weight = document.querySelector("#parcelDetailsForm-domestic-parcelDimensionsForm-weight");
            simulateTextboxType(weight, SHORTCUT[pressedKey]["weight"]);
            const length = document.querySelector("#parcelDetailsForm-domestic-parcelDimensionsForm-length");
            simulateTextboxType(length, SHORTCUT[pressedKey]["length"]);
            const width = document.querySelector("#parcelDetailsForm-domestic-parcelDimensionsForm-width");
            simulateTextboxType(width, SHORTCUT[pressedKey]["width"]);
            const height = document.querySelector("#parcelDetailsForm-domestic-parcelDimensionsForm-height");
            simulateTextboxType(height, SHORTCUT[pressedKey]["height"]);
            setTimeout(function () {
                // click parcel post
                const parcelBtn = document.querySelector("#productSelectorForm-postageService-DOMREG > div > div.service-summary > div > div > div.service-select.ng-scope > button");
                if (parcelBtn) {
                    parcelBtn.click();
                    //check extra coverage
                    const enabledExtraCover = document.querySelector("#productSelectorForm-postageService-DOMREG-features-extraFeatures-transitCover-enabled");
                    simulateCheckboxType(enabledExtraCover, true);
                    const extraCover = document.querySelector("#productSelectorForm-postageService-DOMREG-features-extraFeatures-transitCover-coverAmount")
                    simulateTextboxType(extraCover, SHORTCUT[pressedKey]["extraCover"]);
                }
            }, 2000)

        }


    }
}, false);


