import { describe, test, expect } from '@jest/globals';
import { Graph, MinHeap, buildCompleteGraph } from '../../src/algorithms/graphEngine.js';

describe('MinHeap', () => {
  test('pushes and pops items in priority order', () => {
    const heap = new MinHeap();
    heap.push({ node: 'C', priority: 30 });
    heap.push({ node: 'A', priority: 10 });
    heap.push({ node: 'B', priority: 20 });

    expect(heap.pop().node).toBe('A');
    expect(heap.pop().node).toBe('B');
    expect(heap.pop().node).toBe('C');
  });

  test('returns correct size', () => {
    const heap = new MinHeap();
    expect(heap.size).toBe(0);
    heap.push({ node: 'A', priority: 1 });
    expect(heap.size).toBe(1);
    heap.push({ node: 'B', priority: 2 });
    expect(heap.size).toBe(2);
    heap.pop();
    expect(heap.size).toBe(1);
  });

  test('isEmpty returns true when empty', () => {
    const heap = new MinHeap();
    expect(heap.isEmpty()).toBe(true);
    heap.push({ node: 'A', priority: 1 });
    expect(heap.isEmpty()).toBe(false);
  });

  test('handles duplicate priorities', () => {
    const heap = new MinHeap();
    heap.push({ node: 'A', priority: 5 });
    heap.push({ node: 'B', priority: 5 });
    heap.push({ node: 'C', priority: 5 });

    expect(heap.pop().priority).toBe(5);
    expect(heap.pop().priority).toBe(5);
    expect(heap.pop().priority).toBe(5);
  });

  test('handles single element', () => {
    const heap = new MinHeap();
    heap.push({ node: 'X', priority: 42 });
    expect(heap.pop().node).toBe('X');
    expect(heap.isEmpty()).toBe(true);
  });

  test('handles many items correctly', () => {
    const heap = new MinHeap();
    const values = [50, 10, 30, 5, 20, 40, 15, 25, 35, 45];
    values.forEach(v => heap.push({ node: `N${v}`, priority: v }));

    const sorted = [];
    while (!heap.isEmpty()) sorted.push(heap.pop().priority);
    expect(sorted).toEqual([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
  });
});

describe('Graph', () => {
  test('adds and retrieves nodes', () => {
    const graph = new Graph();
    graph.addNode('A', { latitude: 28.6, longitude: 77.2 });
    graph.addNode('B', { latitude: 28.5, longitude: 77.3 });

    expect(graph.getNode('A')).toBeDefined();
    expect(graph.getNode('A').latitude).toBe(28.6);
    expect(graph.size()).toBe(2);
  });

  test('creates bidirectional edges', () => {
    const graph = new Graph();
    graph.addNode('A', { latitude: 28.6, longitude: 77.2 });
    graph.addNode('B', { latitude: 28.5, longitude: 77.3 });
    graph.addEdge('A', 'B');

    const neighborsA = graph.getNeighbors('A');
    const neighborsB = graph.getNeighbors('B');

    expect(neighborsA.length).toBe(1);
    expect(neighborsA[0].target).toBe('B');
    expect(neighborsB.length).toBe(1);
    expect(neighborsB[0].target).toBe('A');
  });

  test('returns empty neighbors for unknown node', () => {
    const graph = new Graph();
    expect(graph.getNeighbors('unknown')).toEqual([]);
  });

  test('returns undefined for unknown node data', () => {
    const graph = new Graph();
    expect(graph.getNode('unknown')).toBeUndefined();
  });

  test('getNodeIds returns all node IDs', () => {
    const graph = new Graph();
    graph.addNode('A', { latitude: 0, longitude: 0 });
    graph.addNode('B', { latitude: 1, longitude: 1 });
    graph.addNode('C', { latitude: 2, longitude: 2 });

    const ids = graph.getNodeIds();
    expect(ids).toHaveLength(3);
    expect(ids).toContain('A');
    expect(ids).toContain('B');
    expect(ids).toContain('C');
  });

  test('edge weight defaults to haversine distance', () => {
    const graph = new Graph();
    graph.addNode('A', { latitude: 28.6139, longitude: 77.2090 });
    graph.addNode('B', { latitude: 28.5244, longitude: 77.2066 });
    graph.addEdge('A', 'B');

    const neighbors = graph.getNeighbors('A');
    expect(neighbors[0].weight).toBeGreaterThan(9);
    expect(neighbors[0].weight).toBeLessThan(11);
  });

  test('edge weight can be overridden', () => {
    const graph = new Graph();
    graph.addNode('A', { latitude: 0, longitude: 0 });
    graph.addNode('B', { latitude: 1, longitude: 1 });
    graph.addEdge('A', 'B', 42);

    const neighbors = graph.getNeighbors('A');
    expect(neighbors[0].weight).toBe(42);
  });

  test('handles self-edge (adds to adjacency)', () => {
    const graph = new Graph();
    graph.addNode('A', { latitude: 0, longitude: 0 });
    graph.addEdge('A', 'A');
    const neighbors = graph.getNeighbors('A');
    // addEdge is bidirectional, so A->A adds two entries
    expect(neighbors.length).toBe(2);
    expect(neighbors[0].target).toBe('A');
    expect(neighbors[1].target).toBe('A');
  });
});

describe('buildCompleteGraph()', () => {
  test('creates a complete graph from locations', () => {
    const locations = [
      { id: 'A', latitude: 28.6, longitude: 77.2 },
      { id: 'B', latitude: 28.5, longitude: 77.3 },
      { id: 'C', latitude: 28.7, longitude: 77.1 },
    ];

    const graph = buildCompleteGraph(locations);

    expect(graph.size()).toBe(3);
    // Complete graph: each node has N-1 edges
    expect(graph.getNeighbors('A').length).toBe(2);
    expect(graph.getNeighbors('B').length).toBe(2);
    expect(graph.getNeighbors('C').length).toBe(2);
  });

  test('preserves node data', () => {
    const locations = [
      { id: 'depot', latitude: 28.6, longitude: 77.2, name: 'Depot' },
      { id: 'stop1', latitude: 28.5, longitude: 77.3, name: 'Customer A' },
    ];

    const graph = buildCompleteGraph(locations);
    expect(graph.getNode('depot').name).toBe('Depot');
    expect(graph.getNode('stop1').name).toBe('Customer A');
  });

  test('handles single location', () => {
    const graph = buildCompleteGraph([{ id: 'A', latitude: 0, longitude: 0 }]);
    expect(graph.size()).toBe(1);
    expect(graph.getNeighbors('A').length).toBe(0);
  });

  test('handles empty array', () => {
    const graph = buildCompleteGraph([]);
    expect(graph.size()).toBe(0);
  });
});
