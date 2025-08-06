package ai.a2i2.conductor.effrtdemoandroid.ui

import ai.a2i2.conductor.effrtdemoandroid.persistence.GameCache
import ai.a2i2.conductor.effrtdemoandroid.persistence.GameStorage
import ai.a2i2.conductor.effrtdemoandroid.persistence.PracticeTaskAttempt
import ai.a2i2.conductor.effrtdemoandroid.persistence.TaskAttempt
import ai.a2i2.conductor.effrtdemoandroid.ui.data.CloseMessage
import ai.a2i2.conductor.effrtdemoandroid.ui.data.EefrtScreenViewModel
import android.annotation.SuppressLint
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.ViewGroup
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.statusBars
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewAssetLoader.AssetsPathHandler
import androidx.webkit.WebViewAssetLoader.DEFAULT_DOMAIN
import androidx.webkit.WebViewClientCompat
import com.google.gson.Gson
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONException
import org.json.JSONObject
import java.time.Instant
import java.util.Date

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun EefrtScreen(
    viewModel: EefrtScreenViewModel,
    onBack: () -> Unit,
) {
    val exitRequested = remember { mutableStateOf(false) }
    val webView = remember { mutableStateOf<WebView?>(null) }
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    val insets = WindowInsets.statusBars.asPaddingValues()
    val topPaddingDp = insets.calculateTopPadding().value.toInt()
    // On first composition the value is 0, so we need to wait for the second composition to get
    // the actual value before we continue to render the WebView.
    if (topPaddingDp <= 0) return

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_RESUME -> onTaskResume(viewModel, context, webView.value)
                Lifecycle.Event.ON_PAUSE -> onTaskPause(viewModel)
                else -> Unit
            }
        }

        lifecycleOwner.lifecycle.addObserver(observer)

        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            viewModel.interruptionTimestamp.value = null
        }
    }

    Box(contentAlignment = Alignment.Center) {
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
                            request: WebResourceRequest?,
                        ): WebResourceResponse? {
                            // Attempt to resolve the url to an application resource or asset
                            return request?.let { req ->
                                assetLoader.shouldInterceptRequest(req.url)
                            }
                        }

                        override fun onPageFinished(view: WebView?, url: String?) {
                            super.onPageFinished(view, url)

                            // inject the stored calibrationComplete and calibratedMaxPressCount values into the cache
                            val gameStorage = GameStorage(context)
                            val cache = gameStorage.cachedGameState ?: GameCache()
                            if (gameStorage.calibrationComplete == true && gameStorage.calibratedMaxPressCount != null) {
                                cache.calibrationComplete = true
                                cache.maxPressCount = gameStorage.calibratedMaxPressCount!!
                            }
                            cache.attemptCount = gameStorage.eefrtAttemptCount

                            val json = Json {
                                encodeDefaults = true
                            }
                            val cacheJson = json.encodeToString(cache)
                            val jsString = "window.setupGameWithCache(${cacheJson});"
                            evaluateJavascript(jsString, null)
                        }
                    }
                    settings.javaScriptEnabled = true
                    addJavascriptInterface(
                        EefrtWebInterface(topPaddingDp) { message ->
                            handleMessage(
                                message,
                                onBack,
                                exitRequested,
                                viewModel,
                                context
                            )
                        },
                        "AndroidBridge"
                    )
                    // An unused domain reserved for Android applications to intercept requests for app assets.
                    loadUrl("https://$DEFAULT_DOMAIN/assets/index.html")
                }
            }
        )

        if (viewModel.showExitDialog.value) {
            val message = if (viewModel.rewardThresholdReached(context))
                "You'll still receive a bonus but won't be able to return to the task and add to your bonus payment."
            else
                "You have not completed enough rounds to earn the bonus payment and will lose your progress."

            AlertDialog(
                onDismissRequest = { viewModel.dismissCloseDialog() },
                title = { Text("Quit task?") },
                text = { Text(message) },
                confirmButton = {
                    TextButton(
                        onClick = {
                            viewModel.onConfirmCloseDialog(context, TAG)
                            exitRequested.value = true
                            dismiss(onBack)
                        }
                    ) {
                        Text("Yes, quit task")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { viewModel.dismissCloseDialog() }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }
}

private const val TAG = "EefrtScreen"

private fun onTaskPause(viewModel: EefrtScreenViewModel) {
    // ensure this value is only updated once, while we are actively using the app
    if (viewModel.interruptionTimestamp.value == null) {
        viewModel.interruptionTimestamp.value = Instant.now().toEpochMilli()
    }
}

private fun onTaskResume(viewModel: EefrtScreenViewModel, context: Context, webView: WebView?) {
    val cache = viewModel.getCurrentGameState(context)
        ?.copy() // ensure we get a copy of the game state so the changes we make to the timestamp arent persisted
    val interruptionTimestamp = viewModel.interruptionTimestamp.value

    if (cache == null || interruptionTimestamp == null || webView == null) {
        return
    }
    // append the interruption timestamp to the cache
    cache.interruptionTimestamp = interruptionTimestamp

    // encode the cache and pass it along to the game
    val json = Json {
        encodeDefaults = true
    }
    val cacheJson = json.encodeToString(cache)
    val jsString = "window.setupGameWithCache(${cacheJson});"
    webView.evaluateJavascript(jsString, null)

    // reset the interruptionTimestamp value
    cache.interruptionTimestamp = null
    viewModel.interruptionTimestamp.value = null
}

private fun handleMessage(
    message: String,
    onBack: () -> Unit,
    exitRequested: MutableState<Boolean>,
    viewModel: EefrtScreenViewModel,
    context: Context,
) {
    try {
        val obj = JSONObject(message)
        when (val type = obj.getString("key")) {
            "close" -> {
                if (exitRequested.value) {
                    Log.w(TAG, "User already requested close")
                    return
                }

                /*
                    The exit behaviour is slightly different depending on if we've reached the main trials or not:
                    If we've reached the main trials, show the exit dialog with the appropriate message based on their completion.
                    If they are still in the practice trials, just exit the task.
                    We also want to not show the exit dialog if they are shown the Times Up message.

                    We may also be requested to exit the task if a significant interruption has occurred and will need to determine if the
                    task attempt count should be incremented or not as well.
                 */

                if (obj.isNull("message")) {
                    Log.i(
                        TAG,
                        String.format("User has dismissed eefrt task")
                    )
                    exitRequested.value = true
                    dismiss(onBack)
                    return
                }

                // decode the message from the JS side
                val body = obj.getString("message")
                val gson = Gson()
                val closeMessage = gson.fromJson(body, CloseMessage::class.java)

                // ensure its only incremented if the game is closed, the user has the option to cancel closing the task via the dialog
                if (!closeMessage.shouldShowExitDialog && closeMessage.incrementAttemptCount) {
                    Log.d(
                        TAG,
                        "Incremented attempt count"
                    )
                    val currentAttemptCount = GameStorage(context).eefrtAttemptCount
                    viewModel.updateEEFRTAttemptCount(context, currentAttemptCount + 1)
                    GameStorage(context).cachedGameState?.attemptCount++
                }

                // ensure the game data is reset if we've actually closed the task, similar scenario to the shouldShowExitDialog
                if (!closeMessage.shouldShowExitDialog && closeMessage.taskRequiresRestart) {
                    Log.d(
                        TAG,
                        "Task will be restarted on next load"
                    )
                    viewModel.setCurrentGameState(context, null)
                    viewModel.resumeTrialAvailable.value = false
                }

                if (closeMessage.shouldShowExitDialog) {
                    viewModel.showCloseDialog(closeMessage)
                } else {
                    exitRequested.value = true
                    dismiss(onBack)
                }
            }

            "practiceTrialResult" -> {
                val body = obj.getString("message")
                val gson = Gson()
                val practiceTaskAttempt = gson.fromJson(body, PracticeTaskAttempt::class.java)
                practiceTaskAttempt.createdAt = Date()
                viewModel.savePracticeTaskAttempt(practiceTaskAttempt)
            }

            "trialResult" -> {
                val body = obj.getString("message")
                val gson = Gson()
                val taskAttempt = gson.fromJson(body, TaskAttempt::class.java)
                taskAttempt.createdAt = Date()
                viewModel.saveActualTaskAttempt(taskAttempt)
            }

            "currentGameCache" -> {
                val body = obj.getString("message")
                val gson = Gson()
                val gameCache = gson.fromJson(body, GameCache::class.java)
                viewModel.setCurrentGameState(context, gameCache)

                viewModel.getCurrentGameState(context)?.let {
                    // determine if calibration has been completed, if so then we dont need to set the calibratedMaxPressCount
                    if (it.calibrationComplete) {
                        viewModel.markCalibrationAsComplete(context)
                        return
                    }

                    // save the highest calibrated max press
                    val storedMaxPresses = GameStorage(context).calibratedMaxPressCount ?: 0
                    if (storedMaxPresses < it.maxPressCount) {
                        viewModel.setCalibratedMaxPressCount(context, it.maxPressCount)
                    }
                }
            }

            "gameComplete" -> {
                viewModel.clearEEFRTData(context)
                viewModel.updateGameMarkedAsComplete(context, true)
                exitRequested.value = true
                dismiss(onBack)
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
