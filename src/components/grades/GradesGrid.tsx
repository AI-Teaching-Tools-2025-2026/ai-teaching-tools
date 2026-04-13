"use client";

import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  colorSchemeDark,
  themeQuartz,
} from "ag-grid-community";
import { mockGrades } from "./mockGrades";

ModuleRegistry.registerModules([AllCommunityModule]);

const theme = themeQuartz.withPart(colorSchemeDark);

// Calculate overall grade per student + add showName flag
function prepareRowData(grades: typeof mockGrades) {
  const totals: Record<string, { sum: number; count: number }> = {};

  grades.forEach((g) => {
    if (!totals[g.name]) totals[g.name] = { sum: 0, count: 0 };
    totals[g.name].sum += g.percentage;
    totals[g.name].count += 1;
  });

  // Sort by student then assignment so grouping is correct
  const sorted = grades.slice().sort((a, b) => {
    if (a.name !== b.name) return a.name.localeCompare(b.name);
    return a.assignmentName.localeCompare(b.assignmentName);
  });

  return sorted.map((g, index) => ({
    ...g,
    overallGrade: Number(
      (totals[g.name].sum / totals[g.name].count).toFixed(1),
    ),
    showName: index === 0 || sorted[index - 1].name !== g.name,
  }));
}

const rowData = prepareRowData(mockGrades);

const columnDefs: ColDef[] = [
  {
    field: "name",
    headerName: "Student",
    minWidth: 180,
    cellStyle: { fontWeight: "600" },
    valueFormatter: (params) => (params.data.showName ? params.value : ""),
  },
  {
    field: "assignmentName",
    headerName: "Assignment",
    minWidth: 180,
  },
  {
    field: "score",
    headerName: "Score",
    minWidth: 120,
    valueFormatter: (params) =>
      `${params.data?.score}/${params.data?.maxScore}`,
  },
  {
    field: "percentage",
    headerName: "Grade",
    minWidth: 110,
    valueFormatter: (params) => `${params.value}%`,
    cellStyle: (params) => {
      if (params.value >= 90)
        return { color: "green", fontWeight: "600" } as any;
      if (params.value >= 70) return { color: "#ca8a04" } as any;
      return { color: "red" } as any;
    },
  },
  {
    field: "overallGrade",
    headerName: "Overall",
    minWidth: 120,
    valueFormatter: (params) =>
      params.data.showName ? `${params.value}%` : "",
    cellStyle: (params) => {
      if (!params.data.showName) return {};
      if (params.value >= 90) return { color: "green", fontWeight: "700" };
      if (params.value >= 70) return { color: "#ca8a04", fontWeight: "700" };
      return { color: "red", fontWeight: "700" };
    },
  },
  {
    field: "dateSubmitted",
    headerName: "Submitted",
    minWidth: 150,
    valueFormatter: (params) =>
      params.value ? new Date(params.value).toLocaleDateString() : "",
  },
];

export default function GradesGrid() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        suppressMultiSort={true}
        theme={theme}
        defaultColDef={{
          sortable: false,
          filter: false,
          resizable: true,
          floatingFilter: false,
        }}
      />
    </div>
  );
}
