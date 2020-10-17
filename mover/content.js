console.log("Content running...");
var orderData = null;
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log("Received message: " + request.message);
        if (request.message === "fill_order_data") {
            orderData = request.data;
            function JS_wait() {
                if ($('form.shipping-form').length && $('#parcel-details').length) {
                    populateMyPostForm(orderData);
                } else {
                    window.setTimeout(JS_wait, 100);
                }
            }

            window.setTimeout(JS_wait, 2000);
        }
        return true;
    }
);

document.addEventListener('keypress', event => {
    // alert('key pressed', event.code)
    if (event.altKey && event.code == 'KeyP') {
        var currentUrl = window.location.href;
        var location = new URL(currentUrl)
        // Build url
        var dataUrl = location.origin + location.pathname + '.json';

        console.log(dataUrl);
        chrome.runtime.sendMessage({
            "message": "fetch_order_data",
            "data": dataUrl
        });
    }
})


function setTextValue(elementSelector, value) {
    $('#' + elementSelector).val(value);
    return raiseChangeEvent(elementSelector);
}

function raiseChangeEvent(elementSelector) {
    var event = new Event('change');
    var element = document.getElementById(elementSelector);
    if (element != null) {
        element.dispatchEvent(event);
        $('#' + elementSelector).focus();
        $('#' + elementSelector).blur();
    } else {
        console.log(elementSelector + ' not found.');
    }
    return true;
}

function raiseBlurEvent(elementSelector) {
    var element = document.getElementById(elementSelector);
    if (element != null) {
        element.blur();
    }
    return true;
}


function populateMyPostForm(data) {
    console.log("start populating form");
    const manualAddressSwitchSelector = "recipientDetailsForm-addressForm > ng-form > div > button";
    const countrySelector = "recipientDetailsForm-country-select";
    const businessNameSelector = "recipientDetailsForm-businessName";
    const nameSelector = "recipientDetailsForm-name-typeahead-input";
    const line1Selector = "recipientDetailsForm-addressForm-manualAddressForm-line1";
    const line2Selector = "recipientDetailsForm-addressForm-manualAddressForm-line2";

    // International form
    const suburbSelector = "recipientDetailsForm-addressForm-manualAddressForm-suburb";
    const stateSelector = "recipientDetailsForm-addressForm-manualAddressForm-state";
    const postcodeSelector = "recipientDetailsForm-addressForm-manualAddressForm-postcode";
    const dangerousGoodSelector = "parcelDetailsForm-international-parcelCustomsForm-dangerousGoods";
    const commercialValueSelector = "parcelDetailsForm-international-parcelCustomsForm-commercialValue";
    const exportReasonSelector = "parcelDetailsForm-international-parcelCustomsForm-exportReason";
    const weightSelector = "parcelDetailsForm-international-parcelDimensionsForm-weight";
    const lengthSelector = "parcelDetailsForm-international-parcelDimensionsForm-length";
    const widthSelector = "parcelDetailsForm-international-parcelDimensionsForm-width";
    const heightSelector = "parcelDetailsForm-international-parcelDimensionsForm-height";

    // Domestic form
    const suburbDomesticSelector = "recipientDetailsForm-addressForm-manualAddressForm-locality-suburb";
    const stateDomesticSelector = "recipientDetailsForm-addressForm-manualAddressForm-locality-state";
    const postcodeDomesticSelector = "recipientDetailsForm-addressForm-manualAddressForm-locality-postcode";
    const packageTypeDomesticSelector = "parcelDetailsForm-domestic-packagingType";
    const dangerousDomesticGoodSelector = "parcelDetailsForm-domestic-dangerousGoods";
    const parcelDomesticDescriptionSelector = "parcelDetailsForm-domestic-description";
    const emailSelector = "recipientDetailsForm-email";
    const phoneSelector = "recipientDetailsForm-phone";
    const labelReferenceSelector = "additionalDetailsForm-domestic-labelInformation";
    const weightDomesticSelector = "parcelDetailsForm-domestic-parcelDimensionsForm-weight";

    // Delivery Country
    var countryCode = "string:" + data.shipping_address.country_code;
    var countryOptgroup = $('#' + countrySelector + ' optgroup[label = "A to Z index"]');
    var countryOption = countryOptgroup.find('option[value="' + countryCode + '"]');
    countryOption.attr('selected', true);
    raiseChangeEvent(countrySelector);

    // switch to manual address entry
    $('#' + manualAddressSwitchSelector).click();

    setTextValue(nameSelector, data.shipping_address.name); // Delivery Name
    setTextValue(businessNameSelector, data.shipping_address.company); // Delivery Business Name
    setTextValue(emailSelector, data.email); // Contact Email
    setTextValue(phoneSelector, data.shipping_address.phone); // Delivery Phone
    setTextValue(line1Selector, data.shipping_address.address1); // Delivery Address Line 1 
    setTextValue(line2Selector, data.shipping_address.address2); // Delivery Address Line 2

    if (data.shipping_address.country_code == 'AU') {
        console.log("Domestic Delivery");
        setTextValue(suburbDomesticSelector, data.shipping_address.city); // Delivery Suburb
        setTextValue(stateDomesticSelector, "string:" + data.shipping_address.province_code); // Delivery State
        setTextValue(postcodeDomesticSelector, data.shipping_address.zip); // Delivery Postcode

        setTextValue(dangerousDomesticGoodSelector, "boolean:false"); // Default to non-dangerous
        setTextValue(weightDomesticSelector, data.total_weight / 1000); // Parcel weight in KG    
        setTextValue(labelReferenceSelector, data.name); // Parcel Reference
        setTextValue(parcelDomesticDescriptionSelector, data.line_items.map(function (item) { return item.sku; }).join(",")); // Parcel description 
        window.setTimeout(function () {
            // Parcel service 
            var optgroup = $('#' + packageTypeDomesticSelector + ' optgroup[label = "Australia Post Flat Rate Satchel (max 5kg)"]');
            var option = optgroup.find('option[value="string:PKSS"]');
            option.attr('selected', true);
            raiseChangeEvent(packageTypeDomesticSelector);
        }, 1000);

    } else {
        console.log("International Delivery");

        setTextValue(suburbSelector, data.shipping_address.city); // Delivery Suburb
        setTextValue(stateSelector, data.shipping_address.province); // Delivery State
        setTextValue(postcodeSelector, data.shipping_address.zip); // Delivery Postcode

        // Section: Custom Form
        // Wait until custom form displayed. 
        function CUSTOMFORM_wait() {
            if ($('#parcelDetailsForm-international-parcelCustomsForm').length) {
                setTextValue(dangerousGoodSelector, "boolean:false"); // Default to non-dangerous
                setTextValue(commercialValueSelector, "boolean:false"); // Default to with Commercial Value

                window.setTimeout(function () {
                    // Default Export Reason
                    $('#' + exportReasonSelector).val("string:saleOfGoods")
                    raiseChangeEvent(exportReasonSelector);
                }, 500);

                setTextValue(weightSelector, data.total_weight / 1000); // Parcel weight in KG
                setTextValue(widthSelector, 5); // Parcel width in cm
                // $('#' + widthSelector).val("5.0");
                // raiseChangeEvent(widthSelector);
                // Parcel length in cm
                $('#' + lengthSelector).val("5.0");
                raiseChangeEvent(lengthSelector);
                // Parcel height in cm
                $('#' + heightSelector).val("5.0");
                raiseChangeEvent(heightSelector);
            } else {
                window.setTimeout(CUSTOMFORM_wait, 100);
            }
        }
        window.setTimeout(CUSTOMFORM_wait, 500);

        console.log('Item Count: ' + data.line_items.length);
        // Parcel contents
        const addItemContentSelector = "parcelDetailsForm-international-parcelContentsForm > ng-form > fieldset > button";
        var itemDescriptionSelection;
        var itemWeightSelection;
        var itemValueSelection;
        var itemQuantitySelection;

        window.setTimeout(function () {
            for (var index = 0; index < data.line_items.length; index++) {

                if (index < (data.line_items.length - 1)) {
                    $('#' + addItemContentSelector).click();
                }

                itemDescriptionSelection = `parcelDetailsForm-international-parcelContentsForm-parcelItemForm-${index}-description`;
                itemWeightSelection = `parcelDetailsForm-international-parcelContentsForm-parcelItemForm-${index}-itemWeight`;
                itemValueSelection = `parcelDetailsForm-international-parcelContentsForm-parcelItemForm-${index}-itemValue`;
                itemQuantitySelection = `parcelDetailsForm-international-parcelContentsForm-parcelItemForm-${index}-quantity`;

                // Item Content Description
                setTextValue(itemDescriptionSelection, data.line_items[index].name);

                // Item Content Weight
                setTextValue(itemWeightSelection, data.line_items[index].grams / 1000);
                // Item Content $ Value 
                setTextValue(itemValueSelection, data.line_items[index].price);
                // Item Content Quantity
                setTextValue(itemQuantitySelection, data.line_items[index].quantity);
            }
        }, 500);
    }
    return true;
}