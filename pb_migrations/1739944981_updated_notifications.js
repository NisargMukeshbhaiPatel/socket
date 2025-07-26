/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("krcr646e1ocfvp7")

  // remove
  collection.schema.removeField("rae30dej")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "z4po8nhp",
    "name": "project_added",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "luu0h51oncfvn6c",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("krcr646e1ocfvp7")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rae30dej",
    "name": "project_added",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "2shis8y7iptzomn",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // remove
  collection.schema.removeField("z4po8nhp")

  return dao.saveCollection(collection)
})
