package ai.a2i2.conductor.effrtdemoandroid.ui.data

import ai.a2i2.conductor.effrtdemoandroid.persistence.AppDatabase
import ai.a2i2.conductor.effrtdemoandroid.persistence.GameCache
import ai.a2i2.conductor.effrtdemoandroid.persistence.GameStorage
import ai.a2i2.conductor.effrtdemoandroid.persistence.PracticeTaskAttempt
import ai.a2i2.conductor.effrtdemoandroid.persistence.TaskAttempt
import ai.a2i2.conductor.effrtdemoandroid.ui.EefrtScreen
import ai.a2i2.conductor.effrtdemoandroid.util.GameConfigUtils
import android.content.Context
import android.util.Log
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import java.time.Instant

class EefrtScreenViewModel(
    private val appDatabase: AppDatabase,
    context: Context
) : ViewModel() {

    private val _practiceTrialData = mutableStateOf<List<PracticeTaskAttempt>>(emptyList())
    private val _actualTrialData = mutableStateOf<List<TaskAttempt>>(emptyList())

    val resumeTrialAvailable: MutableState<Boolean>
    var showExitDialog: MutableState<Boolean> = mutableStateOf(false)
    var interruptionTimestamp = mutableStateOf<Long?>(null)
    var closeMessage = mutableStateOf<CloseMessage?>(null)

    init {
        refreshData()
        val currentGameState = GameStorage(context).cachedGameState
        resumeTrialAvailable = mutableStateOf(currentGameState?.isResumeTrialAvailable() ?: false)
    }

    private fun refreshData() {
        viewModelScope.launch {
            _practiceTrialData.value =
                appDatabase.practiceTaskAttemptDao().getAllPracticeTrialEvents()
            _actualTrialData.value = appDatabase.taskAttemptDao().getAllTrialEvents()
        }
    }

    fun getPracticeTaskAttempts(): State<List<PracticeTaskAttempt>> {
        return _practiceTrialData
    }

    fun savePracticeTaskAttempt(practiceTaskAttempt: PracticeTaskAttempt) {
        viewModelScope.launch {
            appDatabase.practiceTaskAttemptDao().insert(practiceTaskAttempt)
            refreshData()
        }
    }

    fun deletePracticeTaskAttempt(practiceTaskAttempt: PracticeTaskAttempt) {
        viewModelScope.launch {
            appDatabase.practiceTaskAttemptDao().delete(practiceTaskAttempt)
            refreshData()
        }
    }

    fun getActualTaskAttempts(): State<List<TaskAttempt>> {
        return _actualTrialData
    }

    fun saveActualTaskAttempt(taskAttempt: TaskAttempt) {
        viewModelScope.launch {
            appDatabase.taskAttemptDao().insert(taskAttempt)
            refreshData()
        }
    }

    fun deleteTaskAttempt(taskAttempt: TaskAttempt) {
        viewModelScope.launch {
            appDatabase.taskAttemptDao().delete(taskAttempt)
            refreshData()
        }
    }

    fun deleteAllEvents() {
        viewModelScope.launch {
            appDatabase.taskAttemptDao().deleteAllEvents()
            appDatabase.practiceTaskAttemptDao().deleteAllEvents()
            refreshData()
        }
    }

    fun setCurrentGameState(context: Context, newGameState: GameCache?) {
        GameStorage(context).cachedGameState = newGameState
        resumeTrialAvailable.value = newGameState?.isResumeTrialAvailable() ?: false
    }

    fun getCurrentGameState(context: Context): GameCache? {
        return GameStorage(context).cachedGameState
    }

    fun rewardThresholdReached(context: Context): Boolean {
        return GameConfigUtils.rewardThresholdReached(context)
    }

    // we don't care for the business logic in this app, remember to add it into the main vibe up 2 apps
    fun clearEEFRTData(context: Context) {
        GameStorage(context).cachedGameState = null
        resumeTrialAvailable.value = false
    }

    fun markCalibrationAsComplete(context: Context) {
        GameStorage(context).calibrationComplete = true
    }

    fun setCalibratedMaxPressCount(context: Context, pressCount: Int) {
        GameStorage(context).calibratedMaxPressCount = pressCount
    }

    fun showCloseDialog(closeMessage: CloseMessage) {
        this.closeMessage.value = closeMessage
        showExitDialog.value = true
    }

    fun dismissCloseDialog() {
        closeMessage.value = null
        showExitDialog.value = false
    }

    fun onConfirmCloseDialog(loggingTag: String) {
        // No business logic for this app but a placeholder for the main apps
        closeMessage.value?.let {
            if (it.incrementAttemptCount) {
                Log.d(
                    loggingTag,
                    "Incremented attempt count"
                )
            }

            if (it.taskRequiresRestart) {
                Log.d(
                    loggingTag,
                    "Task will be restarted on next load"
                )
            }
        }

        // dismiss the dialog
        dismissCloseDialog()
    }
}
