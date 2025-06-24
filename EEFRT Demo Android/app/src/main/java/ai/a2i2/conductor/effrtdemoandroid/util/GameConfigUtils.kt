package ai.a2i2.conductor.effrtdemoandroid.util

import ai.a2i2.conductor.effrtdemoandroid.persistence.GameStorage
import android.content.Context

class GameConfigUtils {
    companion object {
        const val REWARD_PAYMENT_THRESHOLD = 0.8

        fun rewardThresholdReached(context: Context): Boolean {
            val trialNumber = GameStorage(context).cachedGameState?.trialNumber?.plus(1) ?: 0
            val nTrials = GameStorage(context).cachedGameState?.randTrialsIdx?.size ?: 0
            val minTrialsCompleted = (nTrials * REWARD_PAYMENT_THRESHOLD).toInt()
            return trialNumber >= minTrialsCompleted
        }
    }
}
