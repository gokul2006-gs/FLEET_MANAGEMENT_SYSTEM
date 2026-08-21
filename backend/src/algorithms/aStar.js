import { MinHeap } from './graphEngine.js';
import { haversine } from './haversine.js';

/**
 * A* shortest path algorithm.
 * Uses f(n) = g(n) + h(n) where:
 *   g(n) = actual cost from start to n
 *   h(n) = heuristic estimate from n to goal (Haversine distance)
 *
 * @param {Graph} graph - The graph instance
 * @param {string} source - Source node ID
 * @param {string} destination - Destination node ID
 * @returns {Object} { path, distance, nodesExplored, executionTime, found }
 */
export function aStar(graph, source, destination) {
  const startTime = performance.now();
  const gScore = new Map(); // Actual cost from source
  const fScore = new Map(); // g + heuristic
  const previous = new Map();
  const closedSet = new Set();
  const openSet = new MinHeap();

  const destNode = graph.getNode(destination);
  if (!destNode) {
    return {
      path: [],
      distance: 0,
      nodesExplored: 0,
      executionTime: performance.now() - startTime,
      found: false
    };
  }

  // Initialize
  for (const nodeId of graph.getNodeIds()) {
    gScore.set(nodeId, Infinity);
    fScore.set(nodeId, Infinity);
    previous.set(nodeId, null);
  }

  gScore.set(source, 0);
  const sourceNode = graph.getNode(source);
  const h0 = haversine(sourceNode.latitude, sourceNode.longitude, destNode.latitude, destNode.longitude);
  fScore.set(source, h0);
  openSet.push({ node: source, priority: h0 });

  let nodesExplored = 0;

  while (!openSet.isEmpty()) {
    const { node: current } = openSet.pop();

    if (current === destination) {
      // Reconstruct path
      const path = [];
      let cur = destination;
      while (cur) {
        path.unshift(cur);
        cur = previous.get(cur);
      }

      return {
        path,
        distance: Math.round(gScore.get(destination) * 100) / 100,
        nodesExplored,
        executionTime: Math.round((performance.now() - startTime) * 100) / 100,
        found: true
      };
    }

    closedSet.add(current);
    nodesExplored++;

    const currentNode = graph.getNode(current);
    const neighbors = graph.getNeighbors(current);

    for (const { target, weight } of neighbors) {
      if (closedSet.has(target)) continue;

      const tentativeG = gScore.get(current) + weight;

      if (tentativeG < gScore.get(target)) {
        previous.set(target, current);
        gScore.set(target, tentativeG);

        const targetNode = graph.getNode(target);
        const h = haversine(targetNode.latitude, targetNode.longitude, destNode.latitude, destNode.longitude);
        const f = tentativeG + h;
        fScore.set(target, f);

        openSet.push({ node: target, priority: f });
      }
    }
  }

  return {
    path: [],
    distance: 0,
    nodesExplored,
    executionTime: Math.round((performance.now() - startTime) * 100) / 100,
    found: false
  };
}
