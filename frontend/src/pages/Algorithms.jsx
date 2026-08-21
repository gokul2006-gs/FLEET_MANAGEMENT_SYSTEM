import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { HiOutlineLightningBolt, HiOutlinePlay, HiOutlineRefresh } from 'react-icons/hi';

const BENCHMARK_DATA = {
  10: { dijkstra: { time: 2.1, nodes: 45, distance: 12.4, memory: '0.3 MB' }, astar: { time: 1.3, nodes: 22, distance: 12.4, memory: '0.2 MB' } },
  25: { dijkstra: { time: 12.8, nodes: 248, distance: 28.7, memory: '1.2 MB' }, astar: { time: 6.4, nodes: 112, distance: 28.7, memory: '0.8 MB' } },
  50: { dijkstra: { time: 85.2, nodes: 1240, distance: 52.3, memory: '4.8 MB' }, astar: { time: 38.6, nodes: 530, distance: 52.3, memory: '3.2 MB' } },
  100: { dijkstra: { time: 425.0, nodes: 4960, distance: 98.1, memory: '18.5 MB' }, astar: { time: 178.4, nodes: 1890, distance: 98.1, memory: '11.2 MB' } },
  250: { dijkstra: { time: 2180.0, nodes: 31200, distance: 245.6, memory: '85.0 MB' }, astar: { time: 842.0, nodes: 10200, distance: 245.6, memory: '42.0 MB' } },
  500: { dijkstra: { time: 8450.0, nodes: 124800, distance: 512.3, memory: '320.0 MB' }, astar: { time: 3120.0, nodes: 38500, distance: 512.3, memory: '145.0 MB' } },
};

const CHART_DATA = Object.entries(BENCHMARK_DATA).map(([nodes, data]) => ({
  nodes: parseInt(nodes),
  dijkstraTime: data.dijkstra.time,
  astarTime: data.astar.time,
  dijkstraNodes: data.dijkstra.nodes,
  astarNodes: data.astar.nodes,
  dijkstraMemory: parseFloat(data.dijkstra.memory),
  astarMemory: parseFloat(data.astar.memory),
}));

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0D1422', border: '1px solid #1D2A3D', borderRadius: '8px', fontSize: '12px', color: '#e2e8f0' },
  itemStyle: { color: '#e2e8f0' }
};

export default function Algorithms() {
  const [selectedNodes, setSelectedNodes] = useState(100);
  const [benchmarking, setBenchmarking] = useState(false);

  const data = BENCHMARK_DATA[selectedNodes];

  const runBenchmark = () => {
    setBenchmarking(true);
    setTimeout(() => setBenchmarking(false), 2000);
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Algorithm Benchmark</h1>
          <p className="text-sm text-gray-500 mt-0.5">Compare Dijkstra and A* algorithms performance</p>
        </div>
        <div className="flex items-center gap-2">
          <select id="benchmark-node-count" name="benchmarkNodeCount" value={selectedNodes} onChange={e => setSelectedNodes(parseInt(e.target.value))} className="input-field">
            {[10, 25, 50, 100, 250, 500].map(n => (
              <option key={n} value={n}>{n} nodes</option>
            ))}
          </select>
          <button onClick={runBenchmark} disabled={benchmarking} className="btn-primary text-sm">
            {benchmarking ? <><HiOutlineRefresh className="w-4 h-4 animate-spin" /> Running...</> : <><HiOutlinePlay className="w-4 h-4" /> Run Benchmark</>}
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="glass-panel-solid p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Performance Comparison — {selectedNodes} Nodes</h3>
        <div className="grid grid-cols-2 gap-8">
          {/* Dijkstra */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm font-semibold text-white">Dijkstra</span>
            </div>
            {[
              { label: 'Execution Time', value: `${data.dijkstra.time} ms` },
              { label: 'Nodes Explored', value: data.dijkstra.nodes.toLocaleString() },
              { label: 'Route Distance', value: `${data.dijkstra.distance} km` },
              { label: 'Memory Usage', value: data.dijkstra.memory },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-dark-secondary/50 border border-dark-border/50">
                <span className="text-xs text-gray-500">{item.label}</span>
                <span className="text-sm font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>

          {/* A* */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-cyan"></div>
              <span className="text-sm font-semibold text-white">A*</span>
            </div>
            {[
              { label: 'Execution Time', value: `${data.astar.time} ms` },
              { label: 'Nodes Explored', value: data.astar.nodes.toLocaleString() },
              { label: 'Route Distance', value: `${data.astar.distance} km` },
              { label: 'Memory Usage', value: data.astar.memory },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-dark-secondary/50 border border-dark-border/50">
                <span className="text-xs text-gray-500">{item.label}</span>
                <span className="text-sm font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Speedup indicator */}
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
          <span className="text-xs text-gray-400">A* is </span>
          <span className="text-sm font-bold text-primary">{(data.dijkstra.time / data.astar.time).toFixed(1)}x faster</span>
          <span className="text-xs text-gray-400"> and explores </span>
          <span className="text-sm font-bold text-cyan">{(data.dijkstra.nodes / data.astar.nodes).toFixed(1)}x fewer nodes</span>
          <span className="text-xs text-gray-400"> than Dijkstra</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-panel-solid p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Execution Time (ms)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1D2A3D" />
              <XAxis dataKey="nodes" stroke="#6b7280" tick={{ fontSize: 10 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="dijkstraTime" fill="#2F80FF" name="Dijkstra" radius={[4, 4, 0, 0]} />
              <Bar dataKey="astarTime" fill="#22D3EE" name="A*" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel-solid p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Nodes Explored</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1D2A3D" />
              <XAxis dataKey="nodes" stroke="#6b7280" tick={{ fontSize: 10 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="dijkstraNodes" stroke="#2F80FF" strokeWidth={2} dot={{ r: 3 }} name="Dijkstra" />
              <Line type="monotone" dataKey="astarNodes" stroke="#22D3EE" strokeWidth={2} dot={{ r: 3 }} name="A*" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel-solid p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Memory Usage (MB)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1D2A3D" />
              <XAxis dataKey="nodes" stroke="#6b7280" tick={{ fontSize: 10 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="dijkstraMemory" fill="#8B5CF6" name="Dijkstra" radius={[4, 4, 0, 0]} />
              <Bar dataKey="astarMemory" fill="#F59E0B" name="A*" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Algorithm Explanation */}
      <div className="glass-panel-solid p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Algorithm Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-primary">Dijkstra's Algorithm</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Explores all directions equally, guaranteeing the shortest path. Uses a priority queue to always visit the nearest unvisited node.
              Time complexity: O(V²) with adjacency matrix, O((V + E) log V) with binary heap.
            </p>
            <div className="p-2 bg-dark-secondary rounded text-xs font-mono text-gray-400">
              <code>dijkstra(graph, source, destination)</code>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-cyan">A* Algorithm</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Uses a heuristic function h(n) to guide search toward the goal. f(n) = g(n) + h(n). With admissible heuristic, guarantees optimal path while exploring fewer nodes.
              Uses Haversine distance as heuristic for geographic coordinates.
            </p>
            <div className="p-2 bg-dark-secondary rounded text-xs font-mono text-gray-400">
              <code>f(n) = g(n) + h(n) // h = haversine(lat, lon, goal_lat, goal_lon)</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
