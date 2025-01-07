import { BACKEND_URL } from "./constants"
import { LRUCache } from "lru-cache"

const cache = new LRUCache({
  max: 100,  // max size
});

chrome.runtime.onMessage.addListener(
  function(message, sender, senderResponse) {
    let resourceUrl = `${BACKEND_URL}/judgements/${encodeURIComponent(message.url)}`;
    let cached_resp = cache.get(resourceUrl);
    if (cached_resp !== undefined) {
      console.log("serving cached resp");
      senderResponse(cached_resp)
      return true;
    }

    fetch(resourceUrl, {
      method: "PUT",
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        cache.set(resourceUrl, res);
        senderResponse(res);
      });
    return true;
  }
);
