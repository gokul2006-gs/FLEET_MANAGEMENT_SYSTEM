import { haversine } from './haversine.js';

/**
 * Build a weighted graph from geographic points.
 * Nodes are indexed by their ID. Edges are created between all node pairs
 * with weights = haversine distance (representing road distance approximation).
 * In production, this would use real road network data.
 */
export class Graph {
  constructor() {
    this.nodes = new Map(); // id -> { latitude, longitude, ...metadata }
    this.adjacency = new Map(); // id -> [{ target, weight, distance }]
  }

  /**
   * Add a node to the graph
   */
  addNode(id, data) {
    this.nodes.set(id, { ...data, id });
    if (!this.adjacency.has(id)) {
      this.adjacency.set(id, []);
    }
  }

  /**
   * Add a bidirectional edge between two nodes
   */
  addEdge(id1, id2, weight = null) {
    const node1 = this.nodes.get(id1);
    const node2 = this.nodes.get(id2);
    if (!node1 || !node2) return;

    const distance = haversine(
      node1.latitude, node1.longitude,
      node2.latitude, node2.longitude
    );
    const w = weight || distance;

    this.adjacency.get(id1).push({ target: id2, weight: w, distance });
    this.adjacency.get(id2).push({ target: id1, weight: w, distance });
  }

  /**
   * Get neighbors of a node
   */
  getNeighbors(nodeId) {
    return this.adjacency.get(nodeId) || [];
  }

  /**
   * Get node data
   */
  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all node IDs
   */
  getNodeIds() {
    return Array.from(this.nodes.keys());
  }

  /**
   * Get number of nodes
   */
  size() {
    return this.nodes.size;
  }
}

/**
 * Build a complete graph from a list of locations.
 * Every location is connected to every other location.
 * This is suitable for delivery route optimization.
 */
export function buildCompleteGraph(locations) {
  const graph = new Graph();

  locations.forEach(loc => {
    graph.addNode(loc.id, {
      latitude: loc.latitude,
      longitude: loc.longitude,
      address: loc.address,
      name: loc.name || loc.customerName || loc.id
    });
  });

  // Create edges between all pairs
  const ids = locations.map(l => l.id);
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      graph.addEdge(ids[i], ids[j]);
    }
  }

  return graph;
}

/**
 * Create a simple priority queue (min-heap) for Dijkstra/A*
 */
export class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return min;
  }

  get size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[i].priority >= this.heap[parent].priority) break;
      [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const length = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest === i) break;

      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}
