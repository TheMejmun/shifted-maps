package json.entities

import kotlinx.serialization.Serializable

@Serializable
data class Entity(
    val place: Place? = null,
    val stay: Stay? = null,
    val trip: Trip? = null,
)
