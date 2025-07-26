/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "8xnoobbiproha49",
    "created": "2025-02-10 06:41:21.645Z",
    "updated": "2025-02-10 06:41:21.645Z",
    "name": "org_extensions",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ieomwyrw",
        "name": "org",
        "type": "relation",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "collectionId": "mclu2j53gltej2f",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "pj3zlrtc",
        "name": "extension",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "jwionatcsyv65lv",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_KbldH0V` ON `org_extensions` (\n  `org`,\n  `extension`\n)"
    ],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("8xnoobbiproha49");

  return dao.deleteCollection(collection);
})
