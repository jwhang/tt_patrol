import { BACKEND_URL, EVALUTE_MEDIA_CONTENT_MESSAGE, EVALUTE_TEXT_MESSAGE } from "./constants"
import { LRUCache } from "lru-cache"
import { isViolation } from './redact_text';

const judgeRespCache = new LRUCache({
  max: 100,  // max size
});

chrome.runtime.onMessage.addListener(
  function(request, sender, senderResponse) {
    if (request.message === EVALUTE_TEXT_MESSAGE) {
      senderResponse(isViolation(request.text))
      return true;
    } else if (request.message === EVALUTE_MEDIA_CONTENT_MESSAGE) {
      let resourceUrl = `${BACKEND_URL}/judgements/${encodeURIComponent(request.url)}`;
      let cached_resp = judgeRespCache.get(resourceUrl);
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
          judgeRespCache.set(resourceUrl, res);
          senderResponse(res);
        });
      return true;
    } else {
      return true;
    }
  }
);
