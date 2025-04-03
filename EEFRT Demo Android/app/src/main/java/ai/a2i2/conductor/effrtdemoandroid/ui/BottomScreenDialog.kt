package ai.a2i2.conductor.effrtdemoandroid.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.toUpperCase
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class BottomScreenDialogConfig(
    val titleText: String,
    val subtitleText: String,
    val durationSeconds: Int,
    val actionButtonText: String,
    val actionButtonHandler: () -> Unit,
    val timeoutHandler: () -> Unit
)

@Composable
fun BottomScreenDialog(
    config: BottomScreenDialogConfig
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0x66000000))
    ) {
        Spacer(
            modifier = Modifier.weight(1f)
        )

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(
                    RoundedCornerShape(
                        topStart = 25.dp,
                        topEnd = 25.dp,
                        bottomStart = 0.dp,
                        bottomEnd = 0.dp,
                    )
                )
                .background(Color.White)
        ) {
            Row {

            }
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .fillMaxWidth()
            ) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier.padding(
                        horizontal = 18.dp,
                        vertical = 24.dp
                    )
                ) {
                    Text(
                        config.titleText,
                        textAlign = TextAlign.Center,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .padding(horizontal = 8.dp)
                    )

                    Row {
                        Spacer(modifier = Modifier.weight(1f))

                        TimeProgressView(
                            durationSeconds = config.durationSeconds,
                            onTimeUpHandler = config.timeoutHandler
                        )
                    }
                }

                Text(
                    config.subtitleText,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .padding(horizontal = 12.dp)
                        .padding(bottom = 24.dp)
                )

                Button(
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color.White,
                        contentColor = Color(255, 125, 125),
                    ),
                    onClick = config.actionButtonHandler,
                    modifier = Modifier
                        .border(
                            BorderStroke(
                                4.dp,
                                Color(255, 125, 125)
                            ),
                            shape = RoundedCornerShape(25.dp)
                        )
                        .fillMaxWidth(0.9F)
                ) {
                    Text(
                        config.actionButtonText.uppercase(),
                        fontSize = 16.sp,
                    )
                }

                Spacer(Modifier.height(24.dp))
            }
        }
    }
}

@Composable
@Preview
fun BottomScreenDialogPreview() {
    BottomScreenDialog(
        BottomScreenDialogConfig(
            titleText = "Are you still there?",
            subtitleText = "Continue within the next 2 mins to keep collecting coins.",
            durationSeconds = 120,
            actionButtonText = "Continue",
            actionButtonHandler = {},
            timeoutHandler = {}
        )
    )
}