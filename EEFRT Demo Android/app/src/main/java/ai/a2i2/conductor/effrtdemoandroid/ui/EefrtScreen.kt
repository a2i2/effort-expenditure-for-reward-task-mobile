package ai.a2i2.conductor.effrtdemoandroid.ui

import ai.a2i2.conductor.effrtdemoandroid.R
import ai.a2i2.conductor.effrtdemoandroid.persistence.PracticeTaskAttempt
import ai.a2i2.conductor.effrtdemoandroid.persistence.TaskAttempt
import ai.a2i2.conductor.effrtdemoandroid.ui.data.EefrtScreenViewModel
import android.annotation.SuppressLint
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.ViewGroup
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.ViewModel
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewAssetLoader.AssetsPathHandler
import androidx.webkit.WebViewAssetLoader.DEFAULT_DOMAIN
import androidx.webkit.WebViewClientCompat
import com.google.gson.Gson
import org.json.JSONException
import org.json.JSONObject
import java.util.Date

@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun EefrtScreen(
    eefrtViewModel: EefrtScreenViewModel,
    onBack: () -> Unit
) {
    val exitRequested = remember { mutableStateOf(false) }
    val webView = remember { mutableStateOf<WebView?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("") },
                navigationIcon = {
                    IconButton(
                        onClick = {
                            exitRequested.value = true
                            dismiss(onBack)
                        }
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.arrow_left),
                            contentDescription = "Back",
                        )
                    }
                }
            )
        },
        content = { paddingValues ->
            AndroidView(
                factory = {
                    // https://developer.android.com/reference/androidx/webkit/WebViewAssetLoader
                    // We use a WebViewAssetLoader to load the files as if they're being hosted via a server.
                    // This is a safer and compatible with Same-Origin policy (CORS)–a CORS error was being thrown
                    // because our HTML file links JS files in another directory.
                    val assetLoader = WebViewAssetLoader.Builder()
                        // Handler class to open a file from assets directory in the application APK.
                        .addPathHandler("/assets/", AssetsPathHandler(it))
                        .build()
                    WebView.setWebContentsDebuggingEnabled(true)
                    val realWebView = WebView(it)
                    webView.value = realWebView
                    realWebView.apply {
                        layoutParams = ViewGroup.LayoutParams(
                            MATCH_PARENT,
                            MATCH_PARENT
                        )
                        webViewClient = object : WebViewClientCompat() {
                            override fun shouldInterceptRequest(
                                view: WebView?,
                                request: WebResourceRequest?
                            ): WebResourceResponse? {
                                // Attempt to resolve the url to an application resource or asset
                                return request?.let { req ->
                                    assetLoader.shouldInterceptRequest(req.url)
                                }
                            }
                        }
                        settings.javaScriptEnabled = true
                        addJavascriptInterface(
                            EefrtWebInterface { message ->
                                handleMessage(message, onBack, exitRequested, eefrtViewModel)
                            },
                            "AndroidBridge"
                        )
                        // An unused domain reserved for Android applications to intercept requests for app assets.
                        loadUrl("https://$DEFAULT_DOMAIN/assets/index.html")
                    }
                },
                Modifier.padding(top = paddingValues.calculateTopPadding())
            )
        }
    )
}

private const val TAG = "EefrtScreen"

private fun handleMessage(
    message: String,
    onBack: () -> Unit,
    exitRequested: MutableState<Boolean>,
    eefrtViewModel: EefrtScreenViewModel,
) {
    try {
        val obj = JSONObject(message)
        when (val type = obj.getString("key")) {
            "close" -> {
                if (exitRequested.value) {
                    Log.w(TAG, "User already requested close")
                    return
                }
                exitRequested.value = true

                Log.i(
                    TAG,
                    String.format("User has dismissed eefrt task")
                )
                dismiss(onBack)
            }

            "practiceTrialResult" -> {
                val body = obj.getString("message")
                val gson = Gson()
                val practiceTaskAttempt = gson.fromJson(body, PracticeTaskAttempt::class.java)
                practiceTaskAttempt.createdAt = Date()
                eefrtViewModel.savePracticeTaskAttempt(practiceTaskAttempt)
            }

            "trialResult" -> {
                val body = obj.getString("message")
                val gson = Gson()
                val taskAttempt = gson.fromJson(body, TaskAttempt::class.java)
                taskAttempt.createdAt = Date()
                eefrtViewModel.saveActualTaskAttempt(taskAttempt)
            }

            else -> Log.i(
                TAG,
                String.format("Message type %s not yet implemented!", type)
            )
        }
    } catch (e: JSONException) {
        e.printStackTrace()
    }
}

private fun dismiss(onBack: () -> Unit) {
    Handler(Looper.getMainLooper()).post { onBack() }
}