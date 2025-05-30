/*
 * Embed Context
 * -------------
 * Figure out what platform the container is running in and then
 * communicate with is using the appropriate method.
 */
window.EmbedContext = (function () {
  var platform = 'web';
  if (window.webkit && window.webkit.messageHandlers) {
    platform = 'ios';
  }
  if (window.AndroidBridge) {
    platform = 'android';
  }

  // Forward message to app
  function iosSendMessage(key, message) {
    console.log(key + ':'+ message);
    if (webkit.messageHandlers[key]) {
      webkit.messageHandlers[key].postMessage(
        JSON.stringify(message)
      );
    } else {
      console.error(
        "Can't find context message handler for " +
          key +
          ' message:'
      );
      console.error(message);
    }
  }

  function androidSendMessage(key, message) {
    AndroidBridge.onSendMessage(
      JSON.stringify({ key: key, message: message })
    );
  }

  function sendMessage(key, message) {
    window.parent.postMessage({ key: key, message: message });
  }

  function getMessage(key, callback) {
    if (platform === 'android') {
      let message = window.AndroidBridge.getMessage();
      return message;
    } else if (platform === 'ios') {
      return '';
    }
  }

  function getInsetTop() {
    if (platform === 'android') {
      return parseInt(window.AndroidBridge.getInsetTop());
    } else if (platform === 'ios') {
      return this.insetTop;
    } else {
      return this.insetTop ? this.insetTop : 20; // Default
    }
  }

  function setInsetTop(value) {
    this.insetTop = parseInt(value);
  }

  // Return an Embed Context for particular platform
  // (Not using ES6 object shorthand for platform support)
  if (platform === 'ios') {
    return {
      sendMessage: iosSendMessage,
      getMessage: getMessage,
      getInsetTop: getInsetTop,
      setInsetTop: setInsetTop,
    };
  }
  else if (platform === 'android') {
    return {
      sendMessage: androidSendMessage,
      getMessage: getMessage,
      getInsetTop: getInsetTop,
    };
  } else {
    return {
      sendMessage: sendMessage,
      getMessage: getMessage,
      getInsetTop: getInsetTop,
      setInsetTop: setInsetTop,
    };
  }
})();