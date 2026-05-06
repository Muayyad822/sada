import { useState, useEffect } from 'react';
import { Target, Plus } from 'lucide-react';
import { userService } from '../../services/userService';
import type { Goal } from '../../services/userService';

export const GoalsWidget = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoalTarget, setNewGoalTarget] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGoals = async () => {
    const data = await userService.getGoals();
    if (data && data.length > 0) {
      setGoals(data);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);



  const handleAddGoal = async () => {
    setIsSubmitting(true);
    const success = await userService.saveGoal('TIME', newGoalTarget);
    if (success) {
      setIsAdding(false);
      await fetchGoals();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="glass-card p-8 border-sada-sand-200/10 h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3 text-sada-sand-200">
          <Target size={24} />
          <h3 className="text-xl font-black uppercase tracking-widest">Spiritual Goals</h3>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="p-2 hover:bg-white/5 rounded-full text-sada-sand-100/60 hover:text-sada-sand-200 transition-colors"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      <p className="text-sada-sand-100/60 text-sm mb-6">Set a daily target to maintain your connection with the Quran beyond Ramadan.</p>

      {isAdding ? (
        <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
          <label className="text-xs font-bold text-sada-sand-100/60 uppercase tracking-widest">Daily Minutes</label>
          <div className="flex gap-4">
            <input
              type="number"
              value={newGoalTarget}
              onChange={(e) => setNewGoalTarget(Number(e.target.value))}
              className="w-full bg-dark/50 border border-white/10 rounded-lg px-4 py-2 text-sada-sand-50"
              min="1"
            />
            <button
              onClick={handleAddGoal}
              disabled={isSubmitting}
              className="btn-primary px-4 py-2 rounded-lg text-sm whitespace-nowrap"
            >
              {isSubmitting ? 'Saving...' : 'Set Goal'}
            </button>
          </div>
          <button
            onClick={() => setIsAdding(false)}
            className="text-xs text-sada-sand-100/40 hover:text-red-400 w-full text-center mt-2"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-6 text-sada-sand-100/40 text-sm border border-dashed border-white/10 rounded-xl">
              No active goals. Set one to start tracking!
            </div>
          ) : (
            goals.map((goal, idx) => (
              <div key={goal.id || idx} className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-sada-sand-200">Daily Time (Min)</span>
                  <span className="text-sm font-black text-sada-sand-100">{goal.progressAmount || 0} / {goal.targetAmount}</span>
                </div>
                <div className="h-2 w-full bg-dark/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sada-emerald-600 to-sada-sand-200"
                    style={{ width: `${Math.min(100, ((goal.progressAmount || 0) / goal.targetAmount) * 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
