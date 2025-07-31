package ai.a2i2.conductor.effrtdemoandroid

import ai.a2i2.conductor.effrtdemoandroid.persistence.DatabaseProvider
import ai.a2i2.conductor.effrtdemoandroid.persistence.GameCache
import ai.a2i2.conductor.effrtdemoandroid.persistence.GameStorage
import ai.a2i2.conductor.effrtdemoandroid.ui.EefrtScreen
import ai.a2i2.conductor.effrtdemoandroid.ui.EventLogsView
import ai.a2i2.conductor.effrtdemoandroid.ui.EefrtTrialDetailView
import ai.a2i2.conductor.effrtdemoandroid.ui.data.EefrtScreenViewModel
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import ai.a2i2.conductor.effrtdemoandroid.ui.theme.EFFRTDemoAndroidTheme
import ai.a2i2.conductor.effrtdemoandroid.util.GameConfigUtils
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.TextButton
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.DialogProperties
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController

enum class NavigationScreens(val route: String) {
    HOME("home"),
    EFFRT("eefrt"),
    EVENTS("events"),
    PRACTICE_TRIAL_DETAILS("practice_trial_details"),
    ACTUAL_TRIAL_DETAILS("actual_trial_details"),
}

class MainActivity : ComponentActivity() {
    private val appDatabase by lazy {
        DatabaseProvider.provideAppDatabase(application)
    }

    private val eefrtScreenViewModel: EefrtScreenViewModel by lazy {
        EefrtScreenViewModel(
            appDatabase,
            this
        )
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            EFFRTDemoAndroidTheme {
                NavigationController(eefrtScreenViewModel)
            }
        }
    }
}

@Composable
fun NavigationController(eefrtScreenViewModel: EefrtScreenViewModel) {
    val navController = rememberNavController()
    val context = LocalContext.current
    val showDialog = remember { mutableStateOf(false) }
    val selectedOption = remember { mutableStateOf<String?>(null) }

    if (showDialog.value) {
        OptionsDialog(
            onDismissRequest = { showDialog.value = false },
            onOptionSelected = { option ->
                selectedOption.value = when (option) {
                    "Trial 2" -> "trial-seq-2.json"
                    "Trial 3" -> "trial-seq-3.json"
                    else -> "trial-seq-1.json" // default
                }
                eefrtScreenViewModel.setCurrentGameState(
                    context, GameCache(
                        practiceComplete = false,
                        trialNumber = 0,
                        maxPressCount = 0, // Set this when using calibration value from previous attempts
                        coinRunningTotal = 0,
                        trialResults = emptyMap(),
                        randTrialsIdx = null,
                        trialSeqFilename = selectedOption.value,
                        calibrationComplete = false
                    )
                )
                eefrtScreenViewModel.updateGameMarkedAsComplete(context, false)
                eefrtScreenViewModel.updateEEFRTAttemptCount(context, 1)
                showDialog.value = false
            }
        )
    }

    NavHost(navController = navController, startDestination = NavigationScreens.HOME.route) {
        composable(NavigationScreens.HOME.route) {
            HomeScreen(
                eefrtScreenViewModel = eefrtScreenViewModel,
                onStartTaskPressed = {
                    showDialog.value = true
                },
                onResumeTaskPressed = {
                    navController.navigate(NavigationScreens.EFFRT.route)
                },
                onViewEventLogsPressed = {
                    navController.navigate(NavigationScreens.EVENTS.route)
                }
            )
        }

        composable(NavigationScreens.EFFRT.route) {
            EefrtScreen(
                viewModel = eefrtScreenViewModel,
                onBack = {
                    // check to see if the EEFRT attempt count is exceeded,
                    // show on the home screen that the task would be marked as complete
                    if (GameStorage(context).eefrtAttemptCount > GameConfigUtils.MAX_EEFRT_ATTEMPTS) {
                        eefrtScreenViewModel.updateGameMarkedAsComplete(context, true)
                    }

                    // close the view
                    selectedOption.value = null
                    navController.popBackStack()
                }
            )
        }

        composable(NavigationScreens.EVENTS.route) {
            EventLogsView(
                eefrtScreenViewModel = eefrtScreenViewModel,
                practiceTaskItemPressed = { index ->
                    navController.navigate("${NavigationScreens.PRACTICE_TRIAL_DETAILS}/${index}")
                },
                actualTaskItemPressed = { index ->
                    navController.navigate("${NavigationScreens.ACTUAL_TRIAL_DETAILS}/${index}")
                },
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        composable("${NavigationScreens.PRACTICE_TRIAL_DETAILS.route}/{index}") { navBackStackEntry ->
            val routeIndex = navBackStackEntry.arguments?.getString("index")?.toInt() ?: 0
            val practiceTrialItem = eefrtScreenViewModel.getPracticeTaskAttempts().value[routeIndex]
            EefrtTrialDetailView(
                eefrtTaskAttempt = practiceTrialItem,
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        composable("${NavigationScreens.ACTUAL_TRIAL_DETAILS.route}/{index}") { navBackStackEntry ->
            val routeIndex = navBackStackEntry.arguments?.getString("index")?.toInt() ?: 0
            val trialItem = eefrtScreenViewModel.getActualTaskAttempts().value[routeIndex]
            EefrtTrialDetailView(
                eefrtTaskAttempt = trialItem,
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        if (selectedOption.value != null) {
            navController.navigate(NavigationScreens.EFFRT.route)
        }
    }
}

@Composable
fun HomeScreen(
    eefrtScreenViewModel: EefrtScreenViewModel,
    onStartTaskPressed: () -> Unit,
    onResumeTaskPressed: () -> Unit,
    onViewEventLogsPressed: () -> Unit,
) {
    val context = LocalContext.current

    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxSize()
        ) {
            AppButton(
                name = "Begin new EEFRT Task",
                modifier = Modifier.padding(innerPadding),
                onClick = onStartTaskPressed
            )

            if (eefrtScreenViewModel.resumeTrialAvailable.value) {
                AppButton(
                    name = "Resume current EEFRT Task",
                    modifier = Modifier.padding(innerPadding),
                    onClick = onResumeTaskPressed
                )
            }

            AppButton(
                name = "View Event Logs",
                modifier = Modifier.padding(innerPadding),
                onClick = onViewEventLogsPressed
            )

            if (BuildConfig.DEBUG) {
                Text("Current EEFRT attempt number: ${eefrtScreenViewModel.eefrtAttemptCount.value}")

                Text("Current game marked as complete: ${eefrtScreenViewModel.gameMarkedAsComplete.value}")

                if (eefrtScreenViewModel.resumeTrialAvailable.value) {
                    Text("Can resume from: ${eefrtScreenViewModel.determineResumeTrialString(context)}")
                }
            }
        }
    }
}

@Composable
fun AppButton(name: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Box(
        modifier = modifier
            .padding(16.dp)
    ) {
        Button(
            onClick = onClick,
            modifier = Modifier
                .align(Alignment.Center)
        ) {
            Text(name)
        }
    }
}

@Composable
fun OptionsDialog(
    onDismissRequest: () -> Unit,
    onOptionSelected: (String) -> Unit,
) {
    val options = listOf("Trial 1", "Trial 2", "Trial 3")

    AlertDialog(
        onDismissRequest = onDismissRequest,
        title = { Text("Choose a trial sequence") },
        text = {
            Column {
                options.forEach { option ->
                    TextButton(
                        onClick = {
                            onOptionSelected(option)
                            onDismissRequest()
                        },
                        modifier = Modifier.padding(vertical = 4.dp)
                    ) {
                        Text(
                            text = option,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        },
        confirmButton = {
            // No confirm button, actions are handled by option clicks
        },
        dismissButton = {
            TextButton(onClick = onDismissRequest) {
                Text("Cancel")
            }
        },
        properties = DialogProperties() // Optional: for further customization
    )
}
