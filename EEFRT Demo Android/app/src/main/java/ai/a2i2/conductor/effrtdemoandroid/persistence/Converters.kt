package ai.a2i2.conductor.effrtdemoandroid.persistence

import androidx.room.TypeConverter
import com.google.gson.Gson
import java.util.Date
import kotlin.reflect.javaType
import kotlin.reflect.typeOf

class Converters {
    companion object {
        val gson = Gson()
    }

    @TypeConverter
    fun dateToString(date: Date): String {
        return gson.toJson(date)
    }

    @TypeConverter
    @OptIn(ExperimentalStdlibApi::class)
    fun stringToDate(data: String): Date {
        return gson.fromJson(data, typeOf<Date>().javaType)
    }

    @TypeConverter
    fun intListToString(list: List<Int>): String {
        return gson.toJson(list)
    }

    @TypeConverter
    @OptIn(ExperimentalStdlibApi::class)
    fun stringToIntList(data: String): List<Int> {
        return gson.fromJson(data, typeOf<List<Int>>().javaType)
    }
}
