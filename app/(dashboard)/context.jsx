"use client";
import { createContext, useContext, useState, useEffect } from "react";

const initialState = {
  orgs: [],
  invites: [],
  projects: [],
  user: null,
  storedAccounts: [],
};

const DataContext = createContext(initialState);

export function DataProvider({ children, initialData }) {
  const [orgs, setOrgs] = useState(initialData.orgs || []);
  const [invites, setInvites] = useState(initialData.invites || []);
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(initialData.user || null);
  useEffect(() => {
    setOrgs(initialData.orgs || []);
    setInvites(initialData.invites || []);
    setUser(initialData.user || null);
  }, [initialData]);

  const getOrgById = (id) => {
    return orgs.find((org) => org.org.id === id) || null;
  };

  const getOrgData = (id) => {
    const org = getOrgById(id);
    return org ? org.org : {};
  };

  const getRolesByOrgId = (id) => {
    const org = getOrgById(id);
    return org ? org.roles : [];
  };

  const value = {
    ...initialData,
    orgs,
    invites,
    projects,
    user,
    setProjects,
    setUser,
    getOrgById,
    getOrgData,
    getRolesByOrgId,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
