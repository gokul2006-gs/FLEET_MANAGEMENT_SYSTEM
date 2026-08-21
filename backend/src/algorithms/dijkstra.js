import { MinHeap } from './graphEngine.js';

/**
 * Dijkstra's shortest path algorithm.
 * Finds the shortest path between source and destination in a weighted graph.
 *
 * @param {Graph} graph - The graph instance
 * @param {string} source - Source node ID
 * @param {string} destination - Destination node ID
 * @returns {Object} { path, distance, nodesExplored, executionTime }
 */
export function dijkstra(graph, source, destination) {
  const startTime = performance.now();
  const distances = new Map();
  const previous = new Map();
  const visited = new Set();
  const pq = new MinHeap();

  // Initialize
  for (const nodeId of graph.getNodeIds()) {
    distances.set(nodeId, Infinity);
    previous.set(nodeId, null);
  }
  distances.set(source, 0);
  pq.push({ node: source, priority: 0 });

  let nodesExplored = 0;

  while (!pq.isEmpty()) {
    const { node: current } = pq.pop();

    if (visited.has(current)) continue;
    visited.add(current);
    nodesExplored++;

    // Found destination
    if (current === destination) break;

    const neighbors = graph.getNeighbors(current);
    for (const { target, weight } of neighbors) {
      if (visited.has(target)) continue;

      const newDist = distances.get(current) + weight;
      if (newDist < distances.get(target)) {
        distances.set(target, newDist);
        previous.set(target, current);
        pq.push({ node: target, priority: newDist });
      }
    }
  }

  // Reconstruct path
  const path = [];
  let current = destination;
  while (current) {
    path.unshift(current);
    current = previous.get(current);
  }

  // If no path found
  if (path[0] !== source) {
    return {
      path: [],
      distance: 0,
      nodesExplored,
      executionTime: performance.now() - startTime,
      found: false
    };
  }

  const totalDistance = distances.get(destination);

  return {
    path,
    distance: Math.round(totalDistance * 100) / 100,
    nodesExplored,
    executionTime: Math.round((performance.now() - startTime) * 100) / 100,
    found: true
  };
}

/**
 * Dijkstra from source to ALL nodes (single-source shortest paths).
 * Used for benchmarking and full graph analysis.
 */
export function dijkstraAll(graph, source) {
  const startTime = performance.now();
  const distances = new Map();
  const previous = new Map();
  const visited = new Set();
  const pq = new MinHeap();

  for (const nodeId of graph.getNodeIds()) {
    distances.set(nodeId, Infinity);
    previous.set(nodeId, null);
  }
  distances.set(source, 0);
  pq.push({ node: source, priority: 0 });

  let nodesExplored = 0;

  while (!pq.isEmpty()) {
    const { node: current } = pq.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    nodesExplored++;

    for (const { target, weight } of graph.getNeighbors(current)) {
      if (visited.has(target)) continue;
      const newDist = distances.get(current) + weight;
      if (newDist < distances.get(target)) {
        distances.set(target, newDist);
        previous.set(target, current);
        pq.push({ node: target, priority: newDist });
      }
    }
  }

  return {
    distances: Object.fromEntries(distances),
    previous: Object.fromEntries(previous),
    nodesExplored,
    executionTime: Math.round((performance.now() - startTime) * 100) / 100
  };
}
