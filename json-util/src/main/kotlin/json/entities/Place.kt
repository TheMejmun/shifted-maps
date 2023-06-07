package json.entities

import kotlinx.serialization.Serializable

@Serializable
data class Place(
    val id: Long,
    val location: Location,
    val name: String,
    val placeType: String
)