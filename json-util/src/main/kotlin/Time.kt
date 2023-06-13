import kotlin.math.abs
import kotlin.random.Random

object Time {
    // Time seems to be stored in seconds in the datasets

    const val SECONDS = 1L
    const val MINUTES = SECONDS * 60L
    const val HOURS = MINUTES * 60L
    const val DAYS = HOURS * 24L
    const val WEEKS = DAYS * 7L
    const val MONTHS = DAYS * 30L
    const val YEARS = DAYS * 365L

    fun randomTime(from: Long = 30 * YEARS, until: Long = 60 * YEARS): Long {
        return abs(Random.nextLong(from = from, until = until))
    }
}