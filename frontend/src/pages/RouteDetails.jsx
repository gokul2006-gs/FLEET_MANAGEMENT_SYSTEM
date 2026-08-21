import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineMap, HiOutlineTruck, HiOutlineClock, HiOutlineCheck } from 'react-icons/hi';

const ROUTE_DATA = {
  routeId: 'R-001',
  vehicle: { number: 'DL-01-AB-1234', type: 'Van', capacity: 200 },
  driver: 'Arun Kumar',
  status: 'active',
  totalDistance: 48.2,
  totalDuration: 142,
  totalStops: 18,
  completedStops: 14,
  capacity: '72 / 200 kg',
  algorithm: 'A*',
  optimizationMethod: 'Nearest Neighbor + 2-opt',
  startTime: '09:00 AM',
  estimatedEnd: '12:48 PM',
  progress: 78,
  stops: [
    { seq: 1, customer: 'Arun Kumar', address: '12 MG Road, CP', eta: '09:00', status: 'completed', serviceTime: 5, distance: 0 },
    { seq: 2, customer: 'Priya Sharma', address: '45 Chandni Chowk', eta: '09:15', status: 'completed', serviceTime: 8, distance: 3.2 },
    { seq: 3, customer: 'Rajesh Gupta', address: '78 Qutub Area', eta: '09:45', status: 'completed', serviceTime: 5, distance: 5.8 },
    { seq: 4, customer: 'Meera Patel', address: '23 Jama Masjid', eta: '10:10', status: 'completed', serviceTime: 6, distance: 2.1 },
    { seq: 5, customer: 'Vikram Singh', address: '56 Red Fort', eta: '10:30', status: 'completed', serviceTime: 4, distance: 1.8 },
    { seq: 6, customer: 'Ananya Das', address: '89 Nehru Place', eta: '10:55', status: 'completed', serviceTime: 7, distance: 4.5 },
    { seq: 7, customer: 'Deepak Mishra', address: '34 Daryaganj', eta: '11:15', status: 'completed', serviceTime: 5, distance: 3.1 },
    { seq: 8, customer: 'Neha Kapoor', address: '67 Civil Lines', eta: '11:35', status: 'completed', serviceTime: 6, distance: 2.8 },
    { seq: 9, customer: 'Suresh Reddy', address: '90 Kalkaji', eta: '11:55', status: 'completed', serviceTime: 5, distance: 3.9 },
    { seq: 10, customer: 'Amit Verma', address: '18 Shahdara', eta: '12:05', status: 'completed', serviceTime: 4, distance: 2.3 },
    { seq: 11, customer: 'Shruti Jain', address: '42 Seelampur', eta: '12:18', status: 'completed', serviceTime: 5, distance: 1.9 },
    { seq: 12, customer: 'Manish Tiwari', address: '15 Rajiv Chowk', eta: '12:30', status: 'completed', serviceTime: 6, distance: 2.7 },
    { seq: 13, customer: 'Pooja Agarwal', address: '28 ITO', eta: '12:42', status: 'completed', serviceTime: 5, distance: 1.5 },
    { seq: 14, customer: 'Rohit Sinha', address: '51 Hauz Khas Village', eta: '12:55', status: 'completed', serviceTime: 7, distance: 3.6 },
    { seq: 15, customer: 'Divya Saxena', address: '63 Model Town', eta: '01:10', status: 'in_progress', serviceTime: 5, distance: 2.9 },
    { seq: 16, customer: 'Sanjay Bose', address: '37 Mayur Vihar', eta: '01:30', status: 'pending', serviceTime: 6, distance: 4.2 },
    { seq: 17, customer: 'Ritu Malhotra', address: '82 Vijay Nagar', eta: '01:50', status: 'pending', serviceTime: 5, distance: 3.4 },
    { seq: 18, customer: 'Ajay Chauhan', address: '49 Rajendra Nagar', eta: '02:05', status: 'pending', serviceTime: 4, distance: 2.1 },
  ]
};

export default function RouteDetails() {
  const { id } = useParams();

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div className="flex items-center gap-3">
        <Link to="/routes" className="p-2 rounded-lg hover:bg-dark-hover text-gray-400 hover:text-white transition">
          <HiOutlineArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Route {ROUTE_DATA.routeId}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{ROUTE_DATA.driver} • {ROUTE_DATA.vehicle.number}</p>
        </div>
      </div>

      {/* Route Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Distance', value: `${ROUTE_DATA.totalDistance} km` },
          { label: 'Duration', value: `${Math.floor(ROUTE_DATA.totalDuration / 60)}h ${ROUTE_DATA.totalDuration % 60}m` },
          { label: 'Stops', value: `${ROUTE_DATA.completedStops}/${ROUTE_DATA.totalStops}` },
          { label: 'Capacity', value: ROUTE_DATA.capacity },
          { label: 'Algorithm', value: ROUTE_DATA.algorithm },
          { label: 'Optimization', value: 'NN + 2-opt' },
        ].map(item => (
          <div key={item.label} className="glass-panel p-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{item.label}</p>
            <p className="text-sm font-semibold text-white mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="glass-panel-solid p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">Route Progress</span>
          <span className="text-sm text-primary">{ROUTE_DATA.progress}%</span>
        </div>
        <div className="w-full bg-dark-secondary rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${ROUTE_DATA.progress}%` }}></div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">Start: {ROUTE_DATA.startTime}</span>
          <span className="text-xs text-gray-500">ETA End: {ROUTE_DATA.estimatedEnd}</span>
        </div>
      </div>

      {/* Stop Sequence */}
      <div className="flex-1 glass-panel-solid overflow-y-auto p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Stop Sequence</h3>
        <div className="space-y-0">
          {ROUTE_DATA.stops.map((stop, idx) => (
            <motion.div
              key={stop.seq}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="flex items-start gap-3"
            >
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  stop.status === 'completed' ? 'bg-success text-white' :
                  stop.status === 'in_progress' ? 'bg-primary text-white animate-pulse' :
                  'bg-dark-secondary text-gray-500 border border-dark-border'
                }`}>
                  {stop.status === 'completed' ? <HiOutlineCheck className="w-3.5 h-3.5" /> : stop.seq}
                </div>
                {idx < ROUTE_DATA.stops.length - 1 && (
                  <div className={`w-0.5 h-8 ${stop.status === 'completed' ? 'bg-success/30' : 'bg-dark-border'}`}></div>
                )}
              </div>

              {/* Stop info */}
              <div className="flex-1 pb-3">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${stop.status === 'completed' ? 'text-gray-400' : 'text-white'}`}>{stop.customer}</p>
                  <span className="text-xs text-gray-500">{stop.eta}</span>
                </div>
                <p className="text-xs text-gray-500">{stop.address}</p>
                <div className="flex gap-3 mt-0.5">
                  {stop.distance > 0 && <span className="text-[10px] text-gray-600">{stop.distance} km from previous</span>}
                  <span className="text-[10px] text-gray-600">{stop.serviceTime} min service</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
