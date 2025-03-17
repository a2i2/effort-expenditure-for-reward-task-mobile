package ai.a2i2.conductor.effrtdemoandroid

import ai.a2i2.conductor.effrtdemoandroid.ui.EefrtScreen
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
import androidx.compose.ui.tooling.preview.Preview
import ai.a2i2.conductor.effrtdemoandroid.ui.theme.EFFRTDemoAndroidTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.material3.Button
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.dp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController

enum class NavigationScreens(val route: String) {
    HOME("home"),
    EFFRT("eefrt"),
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            EFFRTDemoAndroidTheme {
                NavigationController()
            }
        }
    }
}

@Composable
fun NavigationController() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = NavigationScreens.HOME.route) {
        composable(NavigationScreens.HOME.route) {
            HomeScreen(
                onClickButton = {
                    navController.navigate(NavigationScreens.EFFRT.route)
                }
            )
        }

        composable(NavigationScreens.EFFRT.route) {
            EefrtScreen(
                onBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}

@Composable
fun HomeScreen(onClickButton: () -> Unit) {
    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        AppButton(
            name = "Begin EEFRT Task",
            modifier = Modifier.padding(innerPadding),
            onClick = onClickButton
        )
    }
}

@Composable
fun AppButton(name: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Box(
        modifier = modifier
            .fillMaxSize()
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

@Preview(showBackground = true)
@Composable
fun HomePreview() {
    EFFRTDemoAndroidTheme {
        NavigationController()
    }
}
