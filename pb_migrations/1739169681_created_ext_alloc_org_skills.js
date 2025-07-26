/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "zpxzcc6njo720bt",
    "created": "2025-02-10 06:41:21.645Z",
    "updated": "2025-02-10 06:41:21.645Z",
    "name": "ext_alloc_org_skills",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "8aptcvsi",
        "name": "ext",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "8xnoobbiproha49",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "rwjz9yjx",
        "name": "title",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
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
  const collection = dao.findCollectionByNameOrId("zpxzcc6njo720bt");

  return dao.deleteCollection(collection);
})
