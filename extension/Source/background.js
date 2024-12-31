baseUrl = "http://172.232.7.65:4000";
imageResourceName = "images";

// TODO(jwhang): Need a client side cache
chrome.runtime.onMessage.addListener(
  function (message, sender, senderResponse) {
    resourceUrl = `${baseUrl}/images/${encodeURIComponent(message.url)}`;
    fetch(resourceUrl, {
      method: "PUT",
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        senderResponse(res);
      });
    return true;
  },
);
