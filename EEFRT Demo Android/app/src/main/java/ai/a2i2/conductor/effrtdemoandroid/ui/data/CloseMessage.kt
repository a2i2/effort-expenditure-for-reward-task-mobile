package ai.a2i2.conductor.effrtdemoandroid.ui.data

import kotlinx.serialization.Serializable

@Serializable
data class CloseMessage(
    val shouldShowExitDialog: Boolean,
    val incrementAttemptCount: Boolean,
    val taskRequiresRestart: Boolean,
)
