/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("actual_org_extension");
  const autoAlloc = new Record(collection, {
    "id": "AUTO_ALLOCATION",
    "class": "AutoAllocation",
    "name": "Auto Allocation",
    "desc": "Automate the process of allocating org members to projects",
    "enabled": true,
    "author": "Socket",
    "author_url": "https://socket.co.in",
  })
  dao.saveRecord(autoAlloc);
  const bcuAssign = new Record(collection, {
    "id": "BCU_ASSIGNMENT",
    "class": "BCUAssignment",
    "name": "BCUAssignment",
    "desc": "A special extension for BCU to assign students to staff",
    "enabled": true,
    "author": "Socket",
    "author_url": "https://socket.co.in"
  });
  dao.saveRecord(bcuAssign);
}, (db) => {
  // add down queries...
})
