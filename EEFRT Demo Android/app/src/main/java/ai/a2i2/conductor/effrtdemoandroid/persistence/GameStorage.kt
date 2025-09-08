package ai.a2i2.conductor.effrtdemoandroid.persistence

import ai.a2i2.conductor.effrtdemoandroid.util.GameConfigUtils
import android.content.Context
import hu.autsoft.krate.SimpleKrate
import hu.autsoft.krate.booleanPref
import hu.autsoft.krate.default.withDefault
import hu.autsoft.krate.intPref
import hu.autsoft.krate.kotlinx.kotlinxPref
import kotlinx.serialization.Serializable

@Serializable
data class GameCache(
    val practiceComplete: Boolean = false,
    val trialNumber: Int = 0,
    var maxPressCount: Int = 0,
    val coinRunningTotal: Int = 0,
    val trialResults: Map<String, Int> = emptyMap(),
    val randTrialsIdx: List<Int>? = null,
    val trialSeqFilename: String? = null,
    var calibrationComplete: Boolean = false,
    var interruptionTimestamp: Long? = null,
    var attemptCount: Int = 1,
    var trialSelections: Map<String, String> = emptyMap()
) {
    fun isResumeTrialAvailable(context: Context): Boolean {
        // Allow the user to resume from the beginning if triggering 2A interruption scenario
        val gameStorage = GameStorage(context)
        if (!practiceComplete && !gameStorage.gameMarkedAsComplete && gameStorage.eefrtAttemptCount == GameConfigUtils.MAX_EEFRT_ATTEMPTS) {
            return true
        }

        return (practiceComplete || trialNumber > 0) && !GameStorage(context).gameMarkedAsComplete
    }
}

class GameStorage(context: Context) : SimpleKrate(context) {
    var cachedGameState: GameCache? by kotlinxPref<GameCache>("cachedGameState").withDefault(
        null
    )
    var calibrationComplete: Boolean? by booleanPref("calibrationComplete").withDefault(null)
    var calibratedMaxPressCount: Int? by intPref("calibratedMaxPressCount").withDefault(null)
    var eefrtAttemptCount: Int by intPref("eefrtAttemptCount").withDefault(1)
    var gameMarkedAsComplete: Boolean by booleanPref("gameMarkedAsComplete").withDefault(false)
}
