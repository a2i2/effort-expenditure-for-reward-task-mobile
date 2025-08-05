package ai.a2i2.conductor.effrtdemoandroid.persistence

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
    var attemptCount: Int = 1
) {
    fun isResumeTrialAvailable(context: Context): Boolean {
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
