/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("actual_prj_extensions");
  const autoAlloc = new Record(collection, {
    "id": "GANTT_CHART",
    "class": "GanttChart",
    "name": "Gantt Chart",
    "desc": "Extension to display project tasks in a Gantt chart",
    "enabled": true,
    "author": "Socket",
    "author_url": "https://socket.co.in",
  })
  dao.saveRecord(autoAlloc);
  const bcuAssign = new Record(collection, {
    "id": "KANBAN_BOARD",
    "class": "KanbanBoard",
    "name": "Kanban Board",
    "desc": "Extension to display project tasks in a Kanban board",
    "enabled": true,
    "author": "Socket",
    "author_url": "https://socket.co.in"
  });
  dao.saveRecord(bcuAssign);
}, (db) => {
  // add down queries...
})
