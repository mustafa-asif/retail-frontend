interface TriggerBadgeProps {
  source?: string;
  performedBy?: string | null;
  action?: string;
}

export function TriggerBadge({ source, performedBy, action }: TriggerBadgeProps) {
  // Determine if this is a trigger action based on rules
  const isTrigger = 
    source === 'TRIGGER' || 
    performedBy === null || 
    performedBy === 'SYSTEM' || 
    (action && action.includes('AUTO'));

  if (!isTrigger) return <span className="font-sans font-medium text-xs text-slate-700 uppercase">{action}</span>;

  return (
    <div className="flex items-center gap-2">
      <span 
        title="This action was fired by a database trigger"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 shrink-0 cursor-help"
      >
        ⚡ TRIGGER
      </span>
      <span className="text-slate-700 uppercase font-medium text-xs truncate">
        {action?.replace('AUTO_', '')}
      </span>
    </div>
  );
}
