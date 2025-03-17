package ai.a2i2.conductor.effrtdemoandroid.ui

import android.webkit.JavascriptInterface

class EefrtWebInterface(
    private val sendMessageHandler: (message: String) -> Unit
) {
    @JavascriptInterface
    fun onSendMessage(message: String) {
        sendMessageHandler(message)
    }
}