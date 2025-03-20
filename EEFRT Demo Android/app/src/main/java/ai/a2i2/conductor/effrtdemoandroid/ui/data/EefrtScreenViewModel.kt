package ai.a2i2.conductor.effrtdemoandroid.ui.data

import ai.a2i2.conductor.effrtdemoandroid.persistence.AppDatabase
import ai.a2i2.conductor.effrtdemoandroid.persistence.PracticeTaskAttempt
import ai.a2i2.conductor.effrtdemoandroid.persistence.TaskAttempt
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch

class EefrtScreenViewModel(
    private val appDatabase: AppDatabase
) : ViewModel() {

    private val _practiceTrialData = mutableStateOf<List<PracticeTaskAttempt>>(emptyList())
    private val practiceTrialData: State<List<PracticeTaskAttempt>> = _practiceTrialData

    private val _actualTrialData = mutableStateOf<List<TaskAttempt>>(emptyList())
    private val actualTrialData: State<List<TaskAttempt>> = _actualTrialData

    init {
        refreshData()
    }

    private fun refreshData() {
        viewModelScope.launch {
            _practiceTrialData.value =
                appDatabase.practiceTaskAttemptDao().getAllPracticeTrialEvents()
            _actualTrialData.value = appDatabase.taskAttemptDao().getAllTrialEvents()
        }
    }

    fun getPracticeTaskAttempts(): State<List<PracticeTaskAttempt>> {
        return practiceTrialData
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
        return actualTrialData
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
}
