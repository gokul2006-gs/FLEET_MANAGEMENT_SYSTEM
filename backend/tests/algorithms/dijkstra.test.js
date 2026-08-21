import { describe, test, expect } from '@jest/globals';
import { dijkstra, dijkstraAll } from '../../src/algorithms/dijkstra.js';
import { Graph, buildCompleteGraph } from '../../src/algorithms/graphEngine.js';

describe('Dijkstra', () => {
  // Helper: build a small graph for testing
  function buildTestGraph() {
    const graph = new Graph();
    // Nodes at Delhi-ish coordinates
    graph.addNode('A', { latitude: 28.6139, longitude: 77.2090 }); // CP
    graph.addNode('B', { latitude: 28.6507, longitude: 77.2334 }); // Chandni Chowk
    graph.addNode('C', { latitude: 28.5244, longitude: 77.2066 }); // Qutub
    graph.addNode('D', { latitude: 28.6280, longitude: 77.2195 }); // Red Fort area
    graph.addNode('E', { latitude: 28.5535, longitude: 77.2590 }); // Nehru Place

    // Manually set edges with known weights
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
    const result = dijkstra(graph, 'A', 'E');

    expect(result.found).toBe(true);
    expect(result.path).toContain('A');
    expect(result.path).toContain('E');
    // Shortest: A->D->E = 3+4 = 7
    expect(result.distance).toBe(7);
  });

  test('finds shortest path A to B (direct edge)', () => {
    const graph = buildTestGraph();
    const result = dijkstra(graph, 'A', 'B');

    expect(result.found).toBe(true);
    expect(result.distance).toBe(5);
    expect(result.path[0]).toBe('A');
    expect(result.path[result.path.length - 1]).toBe('B');
  });

  test('finds shortest path using indirect route when shorter', () => {
    const graph = buildTestGraph();
    // A->B direct = 5, A->D->B = 3+2 = 5 (tie)
    // A->E direct = not connected, A->D->E = 3+4 = 7, A->B->E = 5+8 = 13
    const result = dijkstra(graph, 'A', 'E');
    expect(result.distance).toBe(7); // A->D->E
  });

  test('returns same node for source === destination', () => {
    const graph = buildTestGraph();
    const result = dijkstra(graph, 'A', 'A');

    expect(result.found).toBe(true);
    expect(result.distance).toBe(0);
    expect(result.path).toEqual(['A']);
  });

  test('returns found: false for unreachable node', () => {
    const graph = new Graph();
    graph.addNode('A', { latitude: 0, longitude: 0 });
    graph.addNode('B', { latitude: 1, longitude: 1 });
    // No edges
    const result = dijkstra(graph, 'A', 'B');
    expect(result.found).toBe(false);
    expect(result.path).toEqual([]);
  });

  test('tracks nodesExplored', () => {
    const graph = buildTestGraph();
    const result = dijkstra(graph, 'A', 'E');
    expect(result.nodesExplored).toBeGreaterThan(0);
    expect(result.nodesExplored).toBeLessThanOrEqual(5);
  });

  test('returns executionTime as a number', () => {
    const graph = buildTestGraph();
    const result = dijkstra(graph, 'A', 'E');
    expect(typeof result.executionTime).toBe('number');
    expect(result.executionTime).toBeGreaterThanOrEqual(0);
  });

  test('path is valid: consecutive nodes are connected', () => {
    const graph = buildTestGraph();
    const result = dijkstra(graph, 'A', 'E');
    expect(result.found).toBe(true);

    for (let i = 0; i < result.path.length - 1; i++) {
      const from = result.path[i];
      const to = result.path[i + 1];
      const neighbors = graph.getNeighbors(from);
      const connected = neighbors.some(n => n.target === to);
      expect(connected).toBe(true);
    }
  });

  test('works with larger complete graph', () => {
    const locations = [];
    for (let i = 0; i < 15; i++) {
      locations.push({
        id: `N${i}`,
        latitude: 28.6 + (Math.random() - 0.5) * 0.1,
        longitude: 77.2 + (Math.random() - 0.5) * 0.1,
      });
    }

    const graph = buildCompleteGraph(locations);
    const result = dijkstra(graph, 'N0', 'N14');

    expect(result.found).toBe(true);
    expect(result.path.length).toBeGreaterThanOrEqual(2);
    expect(result.distance).toBeGreaterThan(0);
  });

  test('returns consistent results on repeated runs', () => {
    const graph = buildTestGraph();
    const r1 = dijkstra(graph, 'A', 'E');
    const r2 = dijkstra(graph, 'A', 'E');
    expect(r1.distance).toBe(r2.distance);
    expect(r1.path).toEqual(r2.path);
  });
});

describe('dijkstraAll()', () => {
  test('returns distances to all nodes from source', () => {
    const graph = new Graph();
    graph.addNode('A', { latitude: 0, longitude: 0 });
    graph.addNode('B', { latitude: 1, longitude: 0 });
    graph.addNode('C', { latitude: 2, longitude: 0 });

    graph.adjacency.get('A').push({ target: 'B', weight: 5, distance: 5 });
    graph.adjacency.get('B').push({ target: 'A', weight: 5, distance: 5 });
    graph.adjacency.get('B').push({ target: 'C', weight: 3, distance: 3 });
    graph.adjacency.get('C').push({ target: 'B', weight: 3, distance: 3 });

    const result = dijkstraAll(graph, 'A');
    expect(result.distances['A']).toBe(0);
    expect(result.distances['B']).toBe(5);
    expect(result.distances['C']).toBe(8);
  });

  test('returns Infinity for unreachable nodes', () => {
    const graph = new Graph();
    graph.addNode('A', { latitude: 0, longitude: 0 });
    graph.addNode('B', { latitude: 1, longitude: 1 });
    // No edges

    const result = dijkstraAll(graph, 'A');
    expect(result.distances['A']).toBe(0);
    expect(result.distances['B']).toBe(Infinity);
  });

  test('tracks nodesExplored', () => {
    const graph = new Graph();
    graph.addNode('A', { latitude: 0, longitude: 0 });
    graph.addNode('B', { latitude: 1, longitude: 0 });
    graph.adjacency.get('A').push({ target: 'B', weight: 1, distance: 1 });
    graph.adjacency.get('B').push({ target: 'A', weight: 1, distance: 1 });

    const result = dijkstraAll(graph, 'A');
    expect(result.nodesExplored).toBe(2);
  });
});
