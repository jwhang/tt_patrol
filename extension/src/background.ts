import { BACKEND_URL } from "./constants"

// TODO(jwhang): Need a client side cache
chrome.runtime.onMessage.addListener(
  function(message, sender, senderResponse) {
    let resourceUrl = `${BACKEND_URL}/images/${encodeURIComponent(message.url)}`;
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
  }
);
