import json.IO
import json.PLACE_TYPE_USER
import json.distance
import json.entities.Entity
import json.entities.Place
import json.entities.Stay
import json.entities.Trip
import json.safeGet
import java.util.ArrayList
import java.util.Date
import kotlin.math.max
import kotlin.math.min
import kotlin.random.Random

const val MAX_ACTIVITY_DURATION = 12 * Time.HOURS

// Extract all places from dataset
fun extractPlaces(from: String = "demo.json", to: String = "places.json") {
    val input = IO.read(from)
    val places = input
        .filter { it.place != null }

    IO.write(places, to)

    println("Wrote places extracted from $from to $to")
}

// Generate new users out of the place info and a random time
fun generateRandomUsers(vararg names: String) {
    val timeframeStart = Time.randomTime()
    val timeframeEnd = timeframeStart + 3 * Time.MONTHS

    val places = IO.read("places.json")
        .filter { it.place != null }
        .map { it.place!! }
        .filter { it.placeType != PLACE_TYPE_USER }

    for (user in names) {
        val filename = "${user.lowercase()}.json"
        val userdata = ArrayList<Entity>()

        println("Generating user $user")

        // Generate the random data
        var currentTime = timeframeStart
        do {
            // Max one day per action, min 10 minutes
            var duration = Random.nextLong(
                from = 10 * Time.MINUTES,
                until = MAX_ACTIVITY_DURATION
            )
            duration = min(duration, timeframeEnd - currentTime)

            val usedPlaces = places.filter { place ->
                userdata
                    .filter { entity -> entity.trip != null }
                    .map { it.trip!! }
                    .any { it.from == place.id || it.to == place.id }
            }
            val unusedPlaces = places.filter { place ->
                usedPlaces.none { it.id == place.id }
            }

//            println(unusedPlaces.size)

            // Because a Trip + Stay can at most last 2 Days
            // if unused * 2d >= the remaining time, pick an unused place
            val pickUnusedPlaceNext =
                (unusedPlaces.size * 2 * MAX_ACTIVITY_DURATION + MAX_ACTIVITY_DURATION) >= (timeframeEnd - currentTime)
                        && unusedPlaces.isNotEmpty()

            val willEnd = currentTime + duration >= timeframeEnd

            if (willEnd) {
                if (userdata.lastOrNull()?.stay != null) {
                    // Extend last stay
                    val stay = userdata.last().stay!!
                    userdata.removeLast()
                    userdata.add(
                        Entity(
                            stay = Stay(
                                at = stay.at,
                                startAt = stay.startAt,
                                endAt = timeframeEnd,
                                duration = timeframeEnd - stay.at
                            )
                        )
                    )
                } else if (userdata.lastOrNull()?.trip != null) {
                    // Attach stay to end of trip
                    userdata.add(
                        Entity(
                            stay = Stay(
                                at = userdata.last().trip!!.to,
                                startAt = currentTime,
                                endAt = currentTime + duration,
                                duration = duration
                            )
                        )
                    )
                } else {
                    throw RuntimeException("??????")
                }
            } else {
                if (userdata.lastOrNull()?.stay != null) {
                    // Attach trip to end of stay
                    val p1 = places.find { it.id == userdata.last().stay!!.at }!!
                    val p2 = if (pickUnusedPlaceNext) {
                        unusedPlaces.random()
                    } else {
                        places.random()
                    }
                    userdata.add(
                        Entity(
                            trip = Trip(
                                from = p1.id,
                                to = p2.id,
                                startAt = currentTime,
                                endAt = currentTime + duration,
                                distance = distance(p1, p2),
                                duration = duration
                            )
                        )
                    )
                } else if (userdata.lastOrNull()?.trip != null) {
                    // Attach stay to end of trip
                    userdata.add(
                        Entity(
                            stay = Stay(
                                at = userdata.last().trip!!.to,
                                startAt = currentTime,
                                endAt = currentTime + duration,
                                duration = duration
                            )
                        )
                    )
                } else if (userdata.isEmpty()) {
                    // We're starting at a random place
                    userdata.add(
                        Entity(
                            stay = Stay(
                                at = places.random().id,
                                startAt = currentTime,
                                endAt = currentTime + duration,
                                duration = duration
                            )
                        )
                    )
                } else {
                    throw RuntimeException("??????")
                }
            }

            // println("Added: ${userdata.lastOrNull()}")

            currentTime += duration
        } while (currentTime < timeframeEnd)

        println(
            "Done! Unused places: ${
                places.filter { place ->
                    userdata
                        .filter { entity -> entity.trip != null }
                        .map { it.trip!! }
                        .none { it.from == place.id || it.to == place.id }
                }.size
            }"
        )

        IO.write(userdata, filename)
    }
}

fun main(args: Array<String>) {
    extractPlaces()
    generateRandomUsers("Saman", "Lucija", "Phil", "Sam", "Anton", "Jihae")
    println("Done!")
}