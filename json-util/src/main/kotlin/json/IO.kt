package json

import json.entities.*
import kotlinx.serialization.KSerializer
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.SerializersModule
import java.io.BufferedReader
import java.io.File

object IO {
    fun read(from: String = "demo.json"): List<Entity> {
        val bufferedReader: BufferedReader = File("data/$from").bufferedReader()
        val json = bufferedReader.use { it.readText() }
        val parsed = Json.parseToJsonElement(json).jsonArray.map { Json.decodeFromJsonElement<Entity>(it) }

        return parsed
    }

    fun write(toSerialize: List<Entity>, to: String = "places.json") {
        val json = Json.encodeToString(toSerialize)
        File("data/$to").writeText(json)
    }
}