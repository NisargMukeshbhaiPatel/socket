"use client";
import { useEffect } from "react";
import { useData } from "../../../context.jsx";

export default function UpdatePrjSidebar({ projects }) {
  const { setProjects } = useData();
  useEffect(() => {
    setProjects(projects);
  }, [projects]);

  return null;
}
