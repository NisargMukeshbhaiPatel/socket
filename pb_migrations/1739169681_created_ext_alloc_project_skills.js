/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "hwpozlurr42qld1",
    "created": "2025-02-10 06:41:21.645Z",
    "updated": "2025-02-10 06:41:21.645Z",
    "name": "ext_alloc_project_skills",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "p7wykuxe",
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
        "id": "zmqfmbaf",
        "name": "project",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "2shis8y7iptzomn",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "fgx7ouww",
        "name": "skills",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "zpxzcc6njo720bt",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": null,
          "displayFields": null
        }
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_J2x9D0E` ON `ext_alloc_project_skills` (`project`)"
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
  const collection = dao.findCollectionByNameOrId("hwpozlurr42qld1");

  return dao.deleteCollection(collection);
})
