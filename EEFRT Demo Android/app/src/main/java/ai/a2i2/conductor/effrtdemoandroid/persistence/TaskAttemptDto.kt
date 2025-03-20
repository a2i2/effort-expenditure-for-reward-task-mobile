package ai.a2i2.conductor.effrtdemoandroid.persistence

import androidx.room.ColumnInfo
import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.Query
import java.util.Date

@Entity(tableName = "trial_attempt_events")
data class TaskAttempt(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @ColumnInfo(name = "created_at") var createdAt: Date?,
    @ColumnInfo(name = "trial_no") val trialNo: Int,
    @ColumnInfo(name = "trial_start_time") val trialStartTime: Int,
    @ColumnInfo(name = "trial_reward_1") val trialReward1: Int,
    @ColumnInfo(name = "trial_effort_1") val trialEffort1: Int,
    @ColumnInfo(name = "trial_effort_prop_max_1") val trialEffortPropMax1: Double,
    @ColumnInfo(name = "trial_reward_2") val trialReward2: Int,
    @ColumnInfo(name = "trial_effort_2") val trialEffort2: Int,
    @ColumnInfo(name = "trial_effort_prop_max_2") val trialEffortPropMax2: Double,
    @ColumnInfo(name = "choice") val choice: String,
    @ColumnInfo(name = "choice_rt") val choiceRT: Int,
    @ColumnInfo(name = "press_count") val pressCount: Int,
    @ColumnInfo(name = "press_times") val pressTimes: List<Int>,
    @ColumnInfo(name = "trial_success") val trialSuccess: Int,
    @ColumnInfo(name = "coins_running_total") val coinsRunningTotal: Int,
    @ColumnInfo(name = "trial_end_time") val trialEndTime: Int,
    @ColumnInfo(name = "effort_time_limit") val effortTimeLimit: Int,
    @ColumnInfo(name = "recalibration") val recalibration: Int,
    @ColumnInfo(name = "threshold_max") val thresholdMax: Int,
)

@Dao
interface TaskAttemptDto {
    @Insert
    suspend fun insert(taskAttempt: TaskAttempt)

    @Delete
    suspend fun delete(taskAttempt: TaskAttempt)

    @Query("SELECT * FROM trial_attempt_events ORDER BY created_at DESC")
    suspend fun getAllTrialEvents(): List<TaskAttempt>
}
