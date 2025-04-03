package ai.a2i2.conductor.effrtdemoandroid.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.content.MediaType.Companion.Text
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import kotlin.time.Duration

@Composable
fun TimeProgressView(
    durationSeconds: Int,
    onTimeUpHandler: () -> Unit
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

    Box(
        modifier = Modifier
            .clip(
                RoundedCornerShape(12.dp)
            )
            .background(Color.Gray.copy(alpha = 0.2f))
            .padding(horizontal = 12.dp, vertical = 3.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box {
                Canvas(modifier = Modifier.size(20.dp)) {
                    drawArc(
                        color = Color.Gray,
                        startAngle = 270f,
                        sweepAngle = 360f,
                        useCenter = true,
                    )
                }

                Canvas(modifier = Modifier.size(20.dp)) {
                    drawArc(
                        color = Color.Black,
                        startAngle = 270f,
                        sweepAngle = 360 * percentage.value,
                        useCenter = true,
                    )
                }
            }

            Text(
                formatTimeLeft(timeLeft),
                modifier = Modifier.padding(start = 4.dp)
            )
        }
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