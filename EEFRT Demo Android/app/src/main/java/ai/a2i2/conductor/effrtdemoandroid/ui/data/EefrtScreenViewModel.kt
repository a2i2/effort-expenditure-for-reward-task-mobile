package ai.a2i2.conductor.effrtdemoandroid.ui.data

import ai.a2i2.conductor.effrtdemoandroid.persistence.AppDatabase
import ai.a2i2.conductor.effrtdemoandroid.persistence.GameCache
import ai.a2i2.conductor.effrtdemoandroid.persistence.GameStorage
import ai.a2i2.conductor.effrtdemoandroid.persistence.PracticeTaskAttempt
import ai.a2i2.conductor.effrtdemoandroid.persistence.TaskAttempt
import android.content.Context
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch

class EefrtScreenViewModel(
    private val appDatabase: AppDatabase,
    context: Context
) : ViewModel() {

    private val _practiceTrialData = mutableStateOf<List<PracticeTaskAttempt>>(emptyList())
    private val _actualTrialData = mutableStateOf<List<TaskAttempt>>(emptyList())
    val resumeTrialAvailable: MutableState<Boolean>

    init {
        refreshData()
        val currentGameState = GameStorage(context).getCurrentGameState()
        resumeTrialAvailable =
            if (currentGameState == null) mutableStateOf(false) else mutableStateOf(true)
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

    fun setCurrentGameState(context: Context, newGameState: GameCache) {
        GameStorage(context).setCurrentGameState(newGameState)
        resumeTrialAvailable.value = true
    }
}
