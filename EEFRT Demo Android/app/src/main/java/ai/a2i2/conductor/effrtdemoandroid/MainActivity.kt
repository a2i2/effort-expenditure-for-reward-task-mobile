package ai.a2i2.conductor.effrtdemoandroid

import ai.a2i2.conductor.effrtdemoandroid.persistence.DatabaseProvider
import ai.a2i2.conductor.effrtdemoandroid.persistence.GameCache
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
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Button
import androidx.compose.ui.Alignment
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
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

    NavHost(navController = navController, startDestination = NavigationScreens.HOME.route) {
        composable(NavigationScreens.HOME.route) {
            HomeScreen(
                eefrtScreenViewModel = eefrtScreenViewModel,
                onStartTaskPressed = {
                    eefrtScreenViewModel.setCurrentGameState(context, GameCache(
                        practiceComplete = false,
                        trialNumber = 0,
                        maxPressCount = 0,
                        coinRunningTotal = 0,
                        trialResults = emptyMap(),
                        randTrialsIdx = null,
                        trialSeqFilename = "trial-seq-2.json"
                    ))
                    navController.navigate(NavigationScreens.EFFRT.route)
                    eefrtScreenViewModel.setCurrentGameState(context, null) // we are starting a new eefrt task, remove any existing cached data
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
    }
}

@Composable
fun HomeScreen(
    eefrtScreenViewModel: EefrtScreenViewModel,
    onStartTaskPressed: () -> Unit,
    onResumeTaskPressed: () -> Unit,
    onViewEventLogsPressed: () -> Unit
) {
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
