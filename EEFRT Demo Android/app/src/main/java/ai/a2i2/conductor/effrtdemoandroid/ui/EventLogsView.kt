package ai.a2i2.conductor.effrtdemoandroid.ui

import ai.a2i2.conductor.effrtdemoandroid.R
import ai.a2i2.conductor.effrtdemoandroid.ui.data.EefrtScreenViewModel
import android.annotation.SuppressLint
import android.os.Handler
import android.os.Looper
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun EventLogsView(
    eefrtScreenViewModel: EefrtScreenViewModel,
    practiceTaskItemPressed: (Int) -> Unit,
    actualTaskItemPressed: (Int) -> Unit,
    onBack: () -> Unit,

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
                    modifier = Modifier.padding(16.dp)
                )

                practiceTaskAttempts.value.forEachIndexed { index, practiceTaskAttempt ->
                    Row(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = practiceTaskAttempt.createdAt.toString(),
                            modifier = Modifier
                                .padding(16.dp)
                                .clickable {
                                    practiceTaskItemPressed(index)
                                }
                        )

                        Spacer(modifier = Modifier.weight(1f))

                        IconButton(
                            onClick = {
                                eefrtScreenViewModel.deletePracticeTaskAttempt(practiceTaskAttempt)
                            }
                        ) {
                            Image(
                                imageVector = Icons.Outlined.Delete,
                                contentDescription = "Delete",
                                modifier = Modifier
                                    .background(Color.Transparent)
                            )
                        }
                    }
                }

                Spacer(Modifier.padding(vertical = 20f.dp))

                Text(
                    "Actual Attempts",
                    modifier = Modifier.padding(16.dp)
                )

                actualTaskAttempts.value.forEachIndexed { index, taskAttempt ->
                    Row(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = taskAttempt.createdAt.toString(),
                            modifier = Modifier
                                .padding(16.dp)
                                .clickable {
                                    actualTaskItemPressed(index)
                                }
                        )

                        Spacer(modifier = Modifier.weight(1f))

                        IconButton(
                            onClick = {
                                eefrtScreenViewModel.deleteTaskAttempt(taskAttempt)
                            }
                        ) {
                            Image(
                                imageVector = Icons.Outlined.Delete,
                                contentDescription = "Delete",
                                modifier = Modifier
                                    .background(Color.Transparent)
                            )
                        }
                    }
                }
            }
        }
    )
}

private fun dismiss(onBack: () -> Unit) {
    Handler(Looper.getMainLooper()).post { onBack() }
}
