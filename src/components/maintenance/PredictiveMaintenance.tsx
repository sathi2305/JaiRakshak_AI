import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MaintenanceTask } from '../../types';
import {
  Wrench,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  User,
  MapPin,
  DollarSign
} from 'lucide-react';

export const PredictiveMaintenance: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAsset, setNewTaskAsset] = useState('P-104 (Block A Floor 2 Riser)');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Vikram Patel (Field Tech)');
  const [newTaskPriority, setNewTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  useEffect(() => {
    api.getMaintenanceTasks().then(data => setTasks(data));
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: MaintenanceTask['status']) => {
    await api.updateMaintenanceTask(id, { status: newStatus });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const created = await api.createMaintenanceTask({
      title: newTaskTitle,
      assetName: newTaskAsset,
      assignedTo: newTaskAssignee,
      priority: newTaskPriority,
      estimatedCostUsd: 140,
      description: 'Dispatched through JalRakshak Predictive Maintenance dispatch protocol.'
    });

    setTasks(prev => [created, ...prev]);
    setShowNewTaskModal(false);
    setNewTaskTitle('');
  };

  const assets = [
    { name: 'Pipe P-104 (Block A Floor 2)', type: 'CPVC Riser', health: 68, risk: 'HIGH', installYear: 2018, cycles: 'Continuous', status: 'Inspect Imminent' },
    { name: 'Booster Pump Station B-01', type: 'Grundfos Hydro MPC', health: 91, risk: 'LOW', installYear: 2021, cycles: 'Nominal', status: 'Optimal' },
    { name: 'Rooftop Reservoir Tank R-1', type: 'Polyethylene Modular', health: 88, risk: 'LOW', installYear: 2020, cycles: '2 cycles/day', status: 'Cleaned last mo' },
    { name: 'Chiller Feed Loop P-101', type: 'SS 316 Pipeline', health: 94, risk: 'LOW', installYear: 2022, cycles: 'Variable', status: 'Good' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              Predictive Maintenance & Asset Health Engine
            </h1>
            <span className="text-[10px] font-mono uppercase bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              Asset Lifecycle Management
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Proactive degradation monitoring, water hammer fatigue calculation, and field work orders
          </p>
        </div>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Work Order
        </button>
      </div>

      {/* Asset Structural Health Spectrum (Section 16) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
          Critical Water Infrastructure Asset Health
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {assets.map(a => (
            <div key={a.name} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    a.risk === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {a.risk} Failure Risk
                  </span>
                  <span className="text-xs font-bold text-slate-700 font-mono">{a.health}% Health</span>
                </div>
                <h3 className="font-bold text-xs text-slate-900 mt-2">{a.name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{a.type} • {a.installYear}</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${a.health < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${a.health}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between">
                <span>Duty: {a.cycles}</span>
                <span className="font-semibold text-slate-700">{a.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Work Orders List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Maintenance Work Orders ({tasks.length})
          </h2>
          <span className="text-xs text-slate-400">
            Assigned to field technician dispatch
          </span>
        </div>

        <div className="space-y-3">
          {tasks.map(t => (
            <div key={t.id} className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{t.title}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    t.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {t.priority}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {t.assetName}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {t.assignedTo}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    ${t.estimatedCostUsd} est.
                  </span>
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={t.status}
                  onChange={(e) => handleUpdateStatus(t.id, e.target.value as any)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-hidden cursor-pointer ${
                    t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    t.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <option value="NEW">Status: NEW</option>
                  <option value="ASSIGNED">Status: ASSIGNED</option>
                  <option value="IN_PROGRESS">Status: IN PROGRESS</option>
                  <option value="RESOLVED">Status: RESOLVED</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create Work Order */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Create New Maintenance Work Order
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dispatch a verified field technician for physical pipe inspection
            </p>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Work Order Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acoustic leak inspection on Floor 2"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Asset</label>
                <input
                  type="text"
                  value={newTaskAsset}
                  onChange={(e) => setNewTaskAsset(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assignee Field Tech</label>
                <input
                  type="text"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                >
                  <option value="HIGH">High (Immediate)</option>
                  <option value="MEDIUM">Medium (Within 24h)</option>
                  <option value="LOW">Low (Routine)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Dispatch Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
