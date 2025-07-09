package ai.a2i2.conductor.effrtdemoandroid.ui

import ai.a2i2.conductor.effrtdemoandroid.R
import ai.a2i2.conductor.effrtdemoandroid.ui.data.EefrtTaskAttempt
import android.os.Handler
import android.os.Looper
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import android.content.Intent
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EefrtTrialDetailView(
    eefrtTaskAttempt: EefrtTaskAttempt,
    onBack: () -> Unit
) {
    val scrollViewState = rememberScrollState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("") },
                navigationIcon = {
                    IconButton(onClick = { dismiss(onBack) }) {
                        Image(
                            painter = painterResource(id = R.drawable.arrow_left),
                            contentDescription = "Back",
                        )
                    }
                },
                actions = {
                    val context = LocalContext.current
                    IconButton(onClick = {
                        val shareText = EventLogsFormatter.formatTaskAttempt(eefrtTaskAttempt)
                        val shareIntent = Intent().apply {
                            action = Intent.ACTION_SEND
                            putExtra(Intent.EXTRA_TEXT, shareText)
                            type = "text/plain"
                        }
                        context.startActivity(Intent.createChooser(shareIntent, "Share via"))
                    }) {
                        Icon(imageVector = Icons.Filled.Share, contentDescription = "Share")
                    }
                }
            )
        },
        content = { paddingValues ->
            Column(
                modifier = Modifier
                    .verticalScroll(scrollViewState)
                    .padding(paddingValues)
                    .padding(vertical = 16.dp)
            ) {
                SelectionContainer {
                    Text(
                        text = EventLogsFormatter.formatTaskAttempt(eefrtTaskAttempt),
                        modifier = Modifier
                            .padding(horizontal = 16.dp)
                    )
                }
            }
        }
    )
}

private fun dismiss(onBack: () -> Unit) {
    Handler(Looper.getMainLooper()).post { onBack() }
}