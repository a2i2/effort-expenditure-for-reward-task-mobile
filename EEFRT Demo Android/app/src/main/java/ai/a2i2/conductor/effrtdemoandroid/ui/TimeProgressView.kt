package ai.a2i2.conductor.effrtdemoandroid.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay

@Composable
fun TimeProgressView(
    durationSeconds: Int,
    onTimeUpHandler: () -> Unit,
) {
    var timeLeft by remember { mutableIntStateOf(durationSeconds) }
    val percentage =
        remember { derivedStateOf { (timeLeft.toFloat() / durationSeconds.toFloat()).coerceAtMost(1f) } }

    LaunchedEffect(key1 = true) {
        while (timeLeft > 0) {
            delay(1000)
            timeLeft--
        }
        onTimeUpHandler()
    }

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .background(color = Color(0xFFF2F4F7), shape = RoundedCornerShape(size = 6.dp))
            .padding(horizontal = 16.dp, vertical = 4.dp),
    ) {
        Box {
            Canvas(modifier = Modifier.size(16.dp)) {
                drawArc(
                    color = Color(208, 213, 221),
                    startAngle = 270f,
                    sweepAngle = 360f,
                    useCenter = true,
                )
            }

            Canvas(modifier = Modifier.size(16.dp)) {
                drawArc(
                    color = Color(152, 162, 179),
                    startAngle = 270f,
                    sweepAngle = 360 * percentage.value,
                    useCenter = true,
                )
            }
        }

        Text(
            formatTimeLeft(timeLeft),
            modifier = Modifier.padding(start = 4.dp),
        )
    }
}

private fun formatTimeLeft(secondsLeft: Int): String {
    val minutes = secondsLeft / 60
    val seconds = secondsLeft % 60

    return if (seconds < 10) "${minutes}:0${seconds}" else "${minutes}:${seconds}"
}

@Composable
@Preview
fun TimeProgressViewPreview() {
    TimeProgressView(
        durationSeconds = 120,
        onTimeUpHandler = {}
    )
}