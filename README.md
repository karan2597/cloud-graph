
# Cloud Graph Visualization

## Project Summary

This project is a React-based interactive visualization tool for cloud infrastructure. It displays a hierarchical, collapsible graph of cloud accounts and services, with real-time alert and misconfiguration counts. Users can expand/collapse nodes, filter by alert or misconfiguration type, and visually explore the structure and health of their cloud environment. The app is fully interactive, responsive, and runs in the browser at [http://localhost:5173/](http://localhost:5173/).

## Setup

```bash
npm install
npm run dev
```

## Features

- Hierarchical cloud → accounts → services
- Collapsible nodes
- Severity-based coloring
- Zoom, pan, and mini-map
- Alert/misconfiguration icons
- Responsive layout for desktop and mobile
- Interactive legend for filtering

## Collapsibility

- Nodes with children (e.g., cloud accounts) are collapsible. Click a node to expand or collapse its children.
- Collapsed nodes show a "+N" indicator for the number of hidden children.
- Collapsing/expanding is animated and updates the visible graph structure in real time.

## Filtering

- The legend at the top-left allows filtering nodes by Alerts or Misconfigurations.
- Click the Alerts icon to show only alert counts in all nodes.
- Click the Misconfigurations icon to show only misconfiguration counts.
- Click "All" to show both.
- The active filter is visually highlighted in the legend.

## Node Coloring

- Node background color reflects the number of alerts:
  - Green: Low
  - Orange: Medium
  - Red: High

## Project Structure

- `src/components/Graph.jsx`: Main graph logic, collapsibility, filtering, and legend.
- `src/data/nodes.js`: Node and edge data for the graph.
- `src/utils.jsx`: Utility functions and icon mapping.
- `src/index.css`: Styling and responsive layout.

## Usage

- Click nodes to expand/collapse.
- Use the legend to filter by alerts or misconfigurations.
- Zoom, pan, and use the mini-map for navigation.
