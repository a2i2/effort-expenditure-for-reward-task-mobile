package ai.a2i2.conductor.effrtdemoandroid.ui

import android.webkit.JavascriptInterface

class EefrtWebInterface(
    private val statusBarHeight: Int,
    private val sendMessageHandler: (message: String) -> Unit,
) {
    @JavascriptInterface
    fun onSendMessage(message: String) {
        sendMessageHandler(message)
    }

    @JavascriptInterface
    fun getMessage(): String {
        // TODO temp example
        return "Hello World"
    }

    @JavascriptInterface
    fun getInsetTop() = statusBarHeight
}