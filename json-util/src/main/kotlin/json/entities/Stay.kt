package json.entities

import kotlinx.serialization.Serializable

@Serializable
data class Stay(
    val at: Long,
    val startAt: Long,
    val endAt: Long,
    val duration: Long
)
