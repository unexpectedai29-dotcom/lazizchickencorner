import { useState } from 'react';
import { X, ClipboardCheck, Flame, CheckCircle } from 'lucide-react';
import OrderHistory from './OrderHistory';
import { Order, OrderStatus } from '../types';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface OrderAlert {
  id: string;
  orderId: string;
  itemsSummary: string;
  newStatus: 'accepted' | 'ready';
  oldStatus: 'pending';
  estimatedPrepTime?: string;
}

export default function MyOrdersModal({ isOpen, onClose, userId }: MyOrdersModalProps) {
  const [alerts, setAlerts] = useState<OrderAlert[]>([]);

  if (!isOpen) return null;

  const handleOrderStatusChange = (order: Order, oldStatus: OrderStatus) => {
    const itemsSummary = order.items.map(it => `${it.quantity}x ${it.name}`).join(', ');
    const newAlert: OrderAlert = {
      id: `${Date.now()}-${order.id}`,
      orderId: order.id || '',
      itemsSummary,
      newStatus: order.orderStatus as 'accepted' | 'ready',
      oldStatus: oldStatus as 'pending',
      estimatedPrepTime: order.estimatedPrepTime
    };

    setAlerts(prev => [newAlert, ...prev]);
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(al => al.id !== alertId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-flame-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Layout Card */}
      <div className="relative bg-flame-black border border-white/10 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl z-10">
        
        {/* Header toolbar */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-flame-orange animate-bounce" />
            <h3 className="font-display text-2xl text-white uppercase tracking-wider">My Pickup Orders</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/5 text-flame-gray hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>

        {/* Alerts Banner Banner Area */}
        {alerts.length > 0 && (
          <div className="px-6 pt-4 space-y-2 max-h-[180px] overflow-y-auto">
            {alerts.map((alert) => {
              const isReady = alert.newStatus === 'ready';
              return (
                <div 
                  key={alert.id}
                  className={`flex items-start justify-between gap-3 p-3 rounded-lg border transition-all ${
                    isReady 
                      ? 'bg-green-500/10 border-green-500/30 text-green-100'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-50'
                  }`}
                  id={`alert-${alert.orderId}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1 rounded-full mt-0.5 ${
                      isReady ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {isReady ? (
                        <CheckCircle className="w-4 h-4 animate-bounce" />
                      ) : (
                        <Flame className="w-4 h-4 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-accent text-xs font-bold uppercase tracking-wider">
                        {isReady ? '🎉 Order Ready for Pickup!' : '🔥 Cooking Has Started!'}
                      </h4>
                      <p className="text-[11px] text-white/80 leading-relaxed mt-0.5">
                        Your order <strong className="font-mono text-white">#{alert.orderId.substring(0, 8).toUpperCase()}</strong> ({alert.itemsSummary}) {
                          isReady 
                            ? 'is ready at the counter! Collect it at Kahara Bazaar now.' 
                            : 'has been accepted and is now in preparation!'
                        }
                      </p>
                      {alert.estimatedPrepTime && !isReady && (
                        <p className="text-[10px] text-yellow-400 mt-0.5 font-mono">
                          Estimated prep: <strong>{alert.estimatedPrepTime}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors mt-0.5 shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic Orders Scroller */}
        <div className="flex-1 overflow-y-auto p-6">
          <OrderHistory userId={userId} onOrderStatusChange={handleOrderStatusChange} />
        </div>

      </div>
    </div>
  );
}
