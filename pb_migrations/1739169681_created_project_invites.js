/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "qjs5v9ve2u7ghoo",
    "created": "2025-02-10 06:41:21.646Z",
    "updated": "2025-02-10 06:41:21.646Z",
    "name": "project_invites",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "uxz0jbil",
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
        "id": "unash8r8",
        "name": "org_member",
        "type": "relation",
        "required": true,
        "presentable": false,
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
        "id": "vjkpqkky",
        "name": "status",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "PENDING",
            "ACCEPTED",
            "REJECTED"
          ]
        }
      },
      {
        "system": false,
        "id": "5sxkts2w",
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
      "CREATE UNIQUE INDEX `idx_kghLOTv` ON `project_invites` (\n  `project`,\n  `org_member`\n)"
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
  const collection = dao.findCollectionByNameOrId("qjs5v9ve2u7ghoo");

  return dao.deleteCollection(collection);
})
