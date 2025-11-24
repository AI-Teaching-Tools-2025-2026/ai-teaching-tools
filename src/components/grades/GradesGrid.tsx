"use client";

import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, ColDef } from "ag-grid-community";
import { mockGrades } from "./mockGrades";

// Register all community modules (required for AG Grid v34+ modular build)
ModuleRegistry.registerModules([AllCommunityModule]);

// mockGrades imported from ./mockGrades

const columnDefs: ColDef[] = [
  { field: "name", headerName: "Student Name" },
  { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
  { field: "assignmentName", headerName: "Assignment", flex: 1, minWidth: 150 },
  {
    field: "score",
    headerName: "Score",
    flex: 0.6,
    minWidth: 110,
    valueFormatter: (params) =>
      `${params.data?.score}/${params.data?.maxScore}`,
  },
  {
    field: "percentage",
    headerName: "Grade",
    flex: 0.6,
    minWidth: 100,
    valueFormatter: (params) => `${params.value}%`,
  },
  {
    field: "dateSubmitted",
    headerName: "Date Submitted",
    flex: 0.8,
    minWidth: 140,
  },
];

export default function GradesGrid() {
  return (
    // Use AG Grid built-in pagination (requires a fixed height so pager is visible)
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%", height: 500 }}>
        <AgGridReact
          rowData={mockGrades}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          groupDisplayType={"singleColumn"}
          autoGroupColumnDef={{ headerName: "Student", minWidth: 200 }}
          groupDefaultExpanded={1}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            floatingFilter: true,
          }}
        />
      </div>
    </div>
  );
}
