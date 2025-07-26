/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("7o2orffj6pqv01a")

  // remove
  collection.schema.removeField("5kur6wrb")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "moq9h5a6",
    "name": "extension",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "yw6w8hjbf97pz7m",
      "cascadeDelete": true,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("7o2orffj6pqv01a")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "5kur6wrb",
    "name": "extension",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "GANTT_CHART"
      ]
    }
  }))

  // remove
  collection.schema.removeField("moq9h5a6")

  return dao.saveCollection(collection)
})
