/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wrkxuszdzba11wu")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "hk14by1b",
    "name": "change",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "STATUS",
        "TITLE",
        "DESC",
        "PRIORITY",
        "DUE_DATE",
        "ASSIGNED_TO",
        "REVIEWERS"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wrkxuszdzba11wu")

  // remove
  collection.schema.removeField("hk14by1b")

  return dao.saveCollection(collection)
})
