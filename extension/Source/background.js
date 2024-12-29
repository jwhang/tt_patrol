baseUrl = "http://localhost:4000";
imageResourceName = "images";

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
