package ai.a2i2.conductor.effrtdemoandroid.ui

import ai.a2i2.conductor.effrtdemoandroid.R
import ai.a2i2.conductor.effrtdemoandroid.ui.data.EefrtScreenViewModel
import android.annotation.SuppressLint
import android.content.Intent
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
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
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
    val shouldShowDialog = remember { mutableStateOf(false) }
    val scrollState = rememberScrollState()
    val context = LocalContext.current

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
                },
                actions = {
                    Spacer(modifier = Modifier.weight(1f))

                    // Delete all button
                    IconButton(
                        onClick = {
                            shouldShowDialog.value = true
                        },
                        modifier = Modifier.padding(end = 0.dp)
                    ) {
                        Image(
                            painter = painterResource(R.drawable.delete_forever_24dp),
                            contentDescription = "Delete",
                            modifier = Modifier
                                .background(Color.Transparent)
                        )
                    }

                    // Share button
                    IconButton(
                        onClick = {
                            val shareText = EventLogsFormatter.formatAllEventLogs(
                                practiceTaskAttempts.value,
                                actualTaskAttempts.value
                            )
                            val shareIntent = Intent().apply {
                                action = Intent.ACTION_SEND
                                putExtra(Intent.EXTRA_TEXT, shareText)
                                type = "text/plain"
                            }
                            context.startActivity(Intent.createChooser(shareIntent, "Share Event Logs"))
                        }
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Share,
                            contentDescription = "Share Event Logs"
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
                    .padding(horizontal = 4.dp)
            ) {
                Text(
                    "Practice Rounds",
                    fontWeight = FontWeight.Bold,
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
                    "Main Rounds",
                    fontWeight = FontWeight.Bold,
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

                if (shouldShowDialog.value) {
                    AlertDialog(
                        title = { Text("Delete all event logs") },
                        text = { Text("Are you sure you want to remove all the practice and actual trial event log data?") },
                        onDismissRequest = { shouldShowDialog.value = false },
                        confirmButton = {
                            Button(
                                onClick = {
                                    shouldShowDialog.value = false
                                    eefrtScreenViewModel.deleteAllEvents()
                                }
                            ) {
                                Text("Delete")
                            }
                        },
                        dismissButton = {
                            Button(
                                onClick = {
                                    shouldShowDialog.value = false
                                }
                            ) {
                                Text("Cancel")
                            }
                        }
                    )
                }
            }
        }
    )
}

private fun dismiss(onBack: () -> Unit) {
    Handler(Looper.getMainLooper()).post { onBack() }
}
