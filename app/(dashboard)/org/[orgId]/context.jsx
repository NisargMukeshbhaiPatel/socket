"use client";
import { createContext, useContext, useState } from "react";

const DataContext = createContext(null);
export default function OrgDataProvider({ children, currentOrgId, projects }) {
  const getProjectById = (projectId) =>
    projects.find((project) => project.id === projectId);

  const value = {
    currentOrgId,
    projects,
    getProjectById,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useOrgData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useOrgData must be used within a OrgDataProvider");
  }
  return context;
}
