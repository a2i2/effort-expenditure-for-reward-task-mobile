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
    val trialResults: Map<String, Int> = emptyMap<String, Int>(),
    val randTrialsIdx: List<Int>? = null,
    val trialSeqFilename: String? = null,
    var calibrationComplete: Boolean = false
)
) {
    fun isResumeTrialAvailable(): Boolean {
        return practiceComplete || trialNumber > 0
    }
}

class GameStorage(context: Context) : SimpleKrate(context) {
    var cachedGameState: GameCache? by kotlinxPref<GameCache>("cachedGameState").withDefault(
        null
    )
    var calibrationComplete: Boolean? by booleanPref("calibrationComplete").withDefault(null)
    var calibratedMaxPressCount: Int? by intPref("calibratedMaxPressCount").withDefault(null)
}
