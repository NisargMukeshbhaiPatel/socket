/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("jwionatcsyv65lv")

  collection.name = "actual_org_extensions"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("jwionatcsyv65lv")

  collection.name = "actual_org_extension"

  return dao.saveCollection(collection)
})
