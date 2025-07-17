import React from "react";
import { Cloud, Server, Database } from "lucide-react";

/**
 * The default icon size for all cloud/service icons.
 * @type {number}
 */
export const ICON_SIZE = 18;

/**
 * Returns a color based on the number of alerts.
 * @param {number} alerts - The number of alerts.
 * @returns {string} - The color code.
 */
export const getColorByAlertCount = (alerts) => {
  if (alerts > 100) return "#ff6b6b"; // red
  if (alerts > 50) return "#ffa94d"; // orange
  return "#69db7c"; // green
};

/**
 * Base mapping of node types to their respective icons (excluding AWS).
 * @type {Object.<string, JSX.Element>}
 */
export const baseTypeToIcon = {
  cloud: <Cloud size={ICON_SIZE} />,
  gcp: <Server size={ICON_SIZE} />,
  saas: <Server size={ICON_SIZE} />,
  service: <Database size={ICON_SIZE} />,
}; 