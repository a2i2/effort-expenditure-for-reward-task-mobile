package ai.a2i2.conductor.effrtdemoandroid.ui

import ai.a2i2.conductor.effrtdemoandroid.R
import ai.a2i2.conductor.effrtdemoandroid.ui.data.EefrtScreenViewModel
import android.annotation.SuppressLint
import android.os.Handler
import android.os.Looper
import android.widget.ScrollView
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun EventLogsView(
    eefrtScreenViewModel: EefrtScreenViewModel,
    onBack: () -> Unit
) {
    val practiceTaskAttempts = remember { eefrtScreenViewModel.getPracticeTaskAttempts() }
    val actualTaskAttempts = remember { eefrtScreenViewModel.getActualTaskAttempts() }
    val scrollState = rememberScrollState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("") },
                navigationIcon = {
                    IconButton(
                        onClick = {
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
            Column(
                modifier = Modifier
                    .verticalScroll(scrollState)
                    .padding(paddingValues)
            ) {
                Text(
                    "Practice Attempts",
                    modifier = Modifier.padding(8f.dp)
                )

                for (practiceAttemptData in practiceTaskAttempts.value) {
                    Text(
                        text = practiceAttemptData.createdAt.toString(),
                        modifier = Modifier.padding(8f.dp)
                    )
                }

                Spacer(Modifier.padding(vertical = 20f.dp))

                Text(
                    "Actual Attempts",
                    modifier = Modifier.padding(8f.dp)
                )

                for (attemptData in actualTaskAttempts.value) {
                    Text(
                        text = attemptData.createdAt.toString(),
                        modifier = Modifier.padding(8f.dp)
                    )
                }

            }
        }
    )
}

private fun dismiss(onBack: () -> Unit) {
    Handler(Looper.getMainLooper()).post { onBack() }
}
