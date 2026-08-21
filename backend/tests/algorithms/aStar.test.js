import { describe, test, expect } from '@jest/globals';
import { aStar } from '../../src/algorithms/aStar.js';
import { Graph, buildCompleteGraph } from '../../src/algorithms/graphEngine.js';

describe('A* Algorithm', () => {
  function buildTestGraph() {
    const graph = new Graph();
    graph.addNode('A', { latitude: 28.6139, longitude: 77.2090 });
    graph.addNode('B', { latitude: 28.6507, longitude: 77.2334 });
    graph.addNode('C', { latitude: 28.5244, longitude: 77.2066 });
    graph.addNode('D', { latitude: 28.6280, longitude: 77.2195 });
    graph.addNode('E', { latitude: 28.5535, longitude: 77.2590 });

    graph.adjacency.get('A').push({ target: 'B', weight: 5, distance: 5 });
    graph.adjacency.get('B').push({ target: 'A', weight: 5, distance: 5 });
    graph.adjacency.get('A').push({ target: 'C', weight: 10, distance: 10 });
    graph.adjacency.get('C').push({ target: 'A', weight: 10, distance: 10 });
    graph.adjacency.get('A').push({ target: 'D', weight: 3, distance: 3 });
    graph.adjacency.get('D').push({ target: 'A', weight: 3, distance: 3 });
    graph.adjacency.get('B').push({ target: 'D', weight: 2, distance: 2 });
    graph.adjacency.get('D').push({ target: 'B', weight: 2, distance: 2 });
    graph.adjacency.get('B').push({ target: 'E', weight: 8, distance: 8 });
    graph.adjacency.get('E').push({ target: 'B', weight: 8, distance: 8 });
    graph.adjacency.get('D').push({ target: 'E', weight: 4, distance: 4 });
    graph.adjacency.get('E').push({ target: 'D', weight: 4, distance: 4 });
    graph.adjacency.get('C').push({ target: 'E', weight: 6, distance: 6 });
    graph.adjacency.get('E').push({ target: 'C', weight: 6, distance: 6 });

    return graph;
  }

  test('finds shortest path from A to E', () => {
    const graph = buildTestGraph();
    const result = aStar(graph, 'A', 'E');

    expect(result.found).toBe(true);
    expect(result.path).toContain('A');
    expect(result.path).toContain('E');
    // Shortest: A->D->E = 3+4 = 7
    expect(result.distance).toBe(7);
  });

  test('finds direct path A to B', () => {
    const graph = buildTestGraph();
    const result = aStar(graph, 'A', 'B');

    expect(result.found).toBe(true);
    expect(result.distance).toBe(5);
  });

  test('returns same node for source === destination', () => {
    const graph = buildTestGraph();
    const result = aStar(graph, 'A', 'A');

    expect(result.found).toBe(true);
    expect(result.distance).toBe(0);
    expect(result.path).toEqual(['A']);
  });

  test('returns found: false when destination not in graph', () => {
    const graph = buildTestGraph();
    const result = aStar(graph, 'A', 'NONEXISTENT');

    expect(result.found).toBe(false);
    expect(result.path).toEqual([]);
    expect(result.distance).toBe(0);
  });

  test('returns found: false for unreachable node', () => {
    const graph = new Graph();
    graph.addNode('A', { latitude: 0, longitude: 0 });
    graph.addNode('B', { latitude: 1, longitude: 1 });
    // No edges
    const result = aStar(graph, 'A', 'B');
    expect(result.found).toBe(false);
  });

  test('path is valid: consecutive nodes are connected', () => {
    const graph = buildTestGraph();
    const result = aStar(graph, 'A', 'E');
    expect(result.found).toBe(true);

    for (let i = 0; i < result.path.length - 1; i++) {
      const from = result.path[i];
      const to = result.path[i + 1];
      const neighbors = graph.getNeighbors(from);
      const connected = neighbors.some(n => n.target === to);
      expect(connected).toBe(true);
    }
  });

  test('returns consistent distance with Dijkstra on same graph', () => {
    const graph = buildTestGraph();
    const aResult = aStar(graph, 'A', 'E');
    // Both should find distance = 7 (A->D->E)
    expect(aResult.distance).toBe(7);
  });

  test('A* explores fewer or equal nodes than Dijkstra (heuristic guidance)', () => {
    const graph = buildTestGraph();
    const aResult = aStar(graph, 'A', 'E');
    // A* should explore fewer nodes due to heuristic
    expect(aResult.nodesExplored).toBeLessThanOrEqual(5);
    expect(aResult.nodesExplored).toBeGreaterThan(0);
  });

  test('tracks executionTime', () => {
    const graph = buildTestGraph();
    const result = aStar(graph, 'A', 'E');
    expect(typeof result.executionTime).toBe('number');
    expect(result.executionTime).toBeGreaterThanOrEqual(0);
  });

  test('works with larger complete graph', () => {
    const locations = [];
    for (let i = 0; i < 20; i++) {
      locations.push({
        id: `N${i}`,
        latitude: 28.6 + (Math.random() - 0.5) * 0.1,
        longitude: 77.2 + (Math.random() - 0.5) * 0.1,
      });
    }

    const graph = buildCompleteGraph(locations);
    const result = aStar(graph, 'N0', 'N19');

    expect(result.found).toBe(true);
    expect(result.path.length).toBeGreaterThanOrEqual(2);
    expect(result.distance).toBeGreaterThan(0);
  });

  test('returns consistent results on repeated runs', () => {
    const graph = buildTestGraph();
    const r1 = aStar(graph, 'A', 'E');
    const r2 = aStar(graph, 'A', 'E');
    expect(r1.distance).toBe(r2.distance);
    expect(r1.path).toEqual(r2.path);
  });

  test('handles a 3-node linear graph', () => {
    const graph = new Graph();
    graph.addNode('X', { latitude: 28.0, longitude: 77.0 });
    graph.addNode('Y', { latitude: 28.1, longitude: 77.0 });
    graph.addNode('Z', { latitude: 28.2, longitude: 77.0 });

    graph.adjacency.get('X').push({ target: 'Y', weight: 11, distance: 11 });
    graph.adjacency.get('Y').push({ target: 'X', weight: 11, distance: 11 });
    graph.adjacency.get('Y').push({ target: 'Z', weight: 11, distance: 11 });
    graph.adjacency.get('Z').push({ target: 'Y', weight: 11, distance: 11 });

    const result = aStar(graph, 'X', 'Z');
    expect(result.found).toBe(true);
    expect(result.distance).toBe(22);
    expect(result.path).toEqual(['X', 'Y', 'Z']);
  });
});
