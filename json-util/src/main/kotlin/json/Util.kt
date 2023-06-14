package json

import json.entities.Place
import kotlin.math.*

fun <T> List<T>.safeGet(i: Int): T {
    return this[i % this.size]
}

fun <T> Array<T>.safeGet(i: Int): T {
    return this[i % this.size]
}

// Found this formula online somewhere
fun distance(p1: Place, p2: Place): Long {
    val R = 6371e3
    val phi1 = p1.location.lat * PI / 180
    val phi2 = p2.location.lat * PI / 180
    val deltaPhi = (p2.location.lat - p1.location.lat) * PI / 180
    val deltaLambda = (p2.location.lon - p1.location.lon) * PI / 180

    val a = sin(deltaPhi / 2) * sin(deltaPhi / 2) +
            cos(phi1) * cos(phi2) * sin(deltaLambda / 2) * sin(deltaLambda / 2)
    val c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return (R * c).toLong()
}