/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "sfevhik1vkl2mh1",
    "created": "2025-02-10 06:41:21.646Z",
    "updated": "2025-02-10 06:41:21.646Z",
    "name": "project_roles",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "851qnrbc",
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
        "id": "5bu3slqe",
        "name": "name",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 3,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "ogijaprw",
        "name": "is_admin",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "owegohz8",
        "name": "perms",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 5,
          "values": [
            "ADD_PRJ_MEMBERS",
            "MANAGE_PRJ_MEMBERS",
            "MANAGE_PRJ_ROLES",
            "CREATE_TASKS",
            "MANAGE_TASKS"
          ]
        }
      },
      {
        "system": false,
        "id": "zm1evrwm",
        "name": "color",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "uel2u6e4",
        "name": "priority",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_BkDEft1` ON `project_roles` (\n  `project`,\n  `name`\n)"
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
  const collection = dao.findCollectionByNameOrId("sfevhik1vkl2mh1");

  return dao.deleteCollection(collection);
})
