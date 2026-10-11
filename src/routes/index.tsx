import { createFileRoute } from "@tanstack/react-router";
import { MapEditor } from "../components/MapEditor";

export const Route = createFileRoute("/")({ component: MapEditor });