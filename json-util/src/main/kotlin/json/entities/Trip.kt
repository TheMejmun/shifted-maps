package json.entities

import kotlinx.serialization.Serializable

@Serializable
data class Trip(
    val from: Long,
    val to: Long,
    val startAt: Long,
    val endAt: Long,
    val distance: Long,
    val duration: Long
)