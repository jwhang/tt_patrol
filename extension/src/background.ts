import { BACKEND_URL } from "./constants"
import { LRUCache } from 'lru-cache'

const cache = new LRUCache({
  max: 100,  // max size
});

// TODO(jwhang): Need a client side cache
chrome.runtime.onMessage.addListener(
  function(message, sender, senderResponse) {
    let resourceUrl = `${BACKEND_URL}/media_files/${encodeURIComponent(message.url)}`;
    let cached_resp = cache.get(resourceUrl);
    if (cached_resp !== undefined) {
      console.log("Serving cached resp");
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
