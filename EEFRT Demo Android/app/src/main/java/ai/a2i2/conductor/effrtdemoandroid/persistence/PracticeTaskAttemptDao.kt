package ai.a2i2.conductor.effrtdemoandroid.persistence

import ai.a2i2.conductor.effrtdemoandroid.ui.data.EefrtTaskAttempt
import androidx.room.ColumnInfo
import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.Query
import java.util.Date

@Entity(tableName = "practice_trial_events")
data class PracticeTaskAttempt(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @ColumnInfo(name = "created_at") var createdAt: Date?,
    @ColumnInfo(name = "prac_trial_no") val pracTrialNo: Int,
    @ColumnInfo(name = "trial_reward") val trialReward: Int,
    @ColumnInfo(name = "trial_effort") val trialEffort: Int,
    @ColumnInfo(name = "press_count") val pressCount: Int,
    @ColumnInfo(name = "press_times") val pressTimes: List<Int>,
    @ColumnInfo(name = "trial_success") val trialSuccess: Int,
    @ColumnInfo(name = "gems_running_total") val gemsRunningTotal: Int,
    @ColumnInfo(name = "max_press_count") val maxPressCount: Int,
): EefrtTaskAttempt

@Dao
interface PracticeTaskAttemptDao {
    @Insert
    suspend fun insert(practiceTaskAttempt: PracticeTaskAttempt)

    @Delete
    suspend fun delete(practiceTaskAttempt: PracticeTaskAttempt)

    @Query("SELECT * FROM practice_trial_events ORDER BY created_at DESC")
    suspend fun getAllPracticeTrialEvents(): List<PracticeTaskAttempt>
}
