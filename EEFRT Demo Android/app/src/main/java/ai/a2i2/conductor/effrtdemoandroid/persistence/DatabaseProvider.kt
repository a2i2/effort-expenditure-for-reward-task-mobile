package ai.a2i2.conductor.effrtdemoandroid.persistence

import android.content.Context
import androidx.room.Room

object DatabaseProvider {
    fun provideAppDatabase(context: Context): AppDatabase {
        return Room.databaseBuilder(
            context.applicationContext,
            AppDatabase::class.java,
            name = "app_database"
        ).build()
    }
}
