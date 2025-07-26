/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "luu0h51oncfvn6c",
    "created": "2025-02-10 06:41:21.646Z",
    "updated": "2025-02-10 06:41:21.646Z",
    "name": "project_members",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ke7ldlhc",
        "name": "project",
        "type": "relation",
        "required": true,
        "presentable": true,
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
        "id": "0f4tplw9",
        "name": "org_member",
        "type": "relation",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "collectionId": "6ldzh8gfemlzp15",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "wyo344ya",
        "name": "roles",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "sfevhik1vkl2mh1",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": null,
          "displayFields": null
        }
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_NHH8gO6` ON `project_members` (\n  `project`,\n  `org_member`\n)"
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
  const collection = dao.findCollectionByNameOrId("luu0h51oncfvn6c");

  return dao.deleteCollection(collection);
})
