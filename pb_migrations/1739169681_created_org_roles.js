/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "53iqn5jq78ba4yc",
    "created": "2025-02-10 06:41:21.646Z",
    "updated": "2025-02-10 06:41:21.646Z",
    "name": "org_roles",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "trs6bwwy",
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
        "id": "vocd25co",
        "name": "name",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 4,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "txbsux6n",
        "name": "is_admin",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "rawgi6iu",
        "name": "perms",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 6,
          "values": [
            "CREATE_PROJECTS",
            "MANAGE_PROJECTS",
            "INVITE_FOR_PROJECTS",
            "MANAGE_EXTENSIONS",
            "VIEW_EXTENSIONS",
            "ADD_MEMBERS",
            "MANAGE_MEMBERS",
            "MANAGE_ROLES"
          ]
        }
      },
      {
        "system": false,
        "id": "ecsdmvc5",
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
        "id": "iugebqqh",
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
  const collection = dao.findCollectionByNameOrId("53iqn5jq78ba4yc");

  return dao.deleteCollection(collection);
})
