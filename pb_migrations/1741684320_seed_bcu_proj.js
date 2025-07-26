/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("actual_org_extensions");
  const autoAlloc = new Record(collection, {
    "id": "BCU_PROJECT_ASS",
    "class": "BCUProjectAss",
    "name": "BCU Project Assignment",
    "desc": "A special extension for BCU to assign students to staff's projects",
    "enabled": true,
    "author": "Socket",
    "author_url": "https://socket.co.in",
  })
  dao.saveRecord(autoAlloc);
}, (db) => {
  // add down queries...
})
