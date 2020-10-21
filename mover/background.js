console.log("Background running...");
var formUrl = "https://auspost.com.au/mypost-business/shipping-and-tracking/orders/add/retail";
var readyOrders = "https://auspost.com.au/mypost-business/shipping-and-tracking/orders/ready";
var orderData = null;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log("chrome.runtime.onMessage", request);
        if (request.message === "fetch_order_data") {
            console.log(request.data);
            dataUrl = request.data;
            fetch(dataUrl)
                .then(
                    function (response) {
                        if (response.status !== 200) {
                            console.log('Looks like there was a problem. Status Code: ' + response.status);
                            return;
                        }
                        // Examine the text in the response
                        response.json().then(function (data) {
                            console.log(data.order.id);
                            
                            chrome.tabs.query({ url: readyOrders }, function (results) {
                                if (results.length == 0) {
                                    chrome.windows.create({url: formUrl}, function (window) {});
                                } else {
                                    tab=results[0];
                                    chrome.tabs.update(tab.id, {url: formUrl});
                                }
                            });
                            console.log(data.order.id);
                            orderData = data.order;
                        }
                        )
                    })
                .catch(function (err) {
                    console.log('Fetch Error :-S', err);
                })
        }
        return true;
    }
);


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // make sure the status is 'complete' and it's the right tab
    if (tab.url.indexOf(formUrl) != -1 && changeInfo.status == 'complete' && orderData !== null) {
        chrome.tabs.sendMessage(tab.id, {
            "message": "fill_order_data",
            "data": orderData
        });
        orderData=null;
    }
    return true;
});