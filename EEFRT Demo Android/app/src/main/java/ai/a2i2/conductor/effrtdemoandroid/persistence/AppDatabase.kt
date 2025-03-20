package ai.a2i2.conductor.effrtdemoandroid.persistence

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters

@Database(
    entities = [PracticeTaskAttempt::class, TaskAttempt::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun practiceTaskAttemptDao(): PracticeTaskAttemptDao
    abstract fun taskAttemptDao(): TaskAttemptDto
}
