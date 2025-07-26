/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2shis8y7iptzomn")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "hnstv7sv",
    "name": "done_status",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "fzuzlpwylildyvo",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2shis8y7iptzomn")

  // remove
  collection.schema.removeField("hnstv7sv")

  return dao.saveCollection(collection)
})
