package ai.a2i2.conductor.effrtdemoandroid.persistence

import android.content.Context
import hu.autsoft.krate.SimpleKrate
import hu.autsoft.krate.default.withDefault
import hu.autsoft.krate.kotlinx.kotlinxPref
import kotlinx.serialization.Serializable

@Serializable
data class GameCache(
    val practiceComplete: Boolean,
    val trialNumber: Int,
    val maxPressCount: Int,
    val coinRunningTotal: Int,
    val trialResults: Map<String, Int>,
    val randTrialsIdx: List<Int>
)

class GameStorage(context: Context) : SimpleKrate(context) {
    private var cachedGameState: GameCache? by kotlinxPref<GameCache>("cachedGameState").withDefault(
        null
    )

    fun getCurrentGameState(): GameCache? = cachedGameState
    fun setCurrentGameState(newGameState: GameCache) {
        cachedGameState = newGameState
    }
}
