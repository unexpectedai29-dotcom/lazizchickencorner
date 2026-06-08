import { useState, useEffect } from 'react';
import { dbService } from '../firebase';
import { Order, OrderStatus } from '../types';
import LCCLogo from './LCCLogo';
import { showToast } from '../lib/toast';
import { INITIAL_MENU_ITEMS } from '../data';
import { 
  Flame, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ChefHat, 
  Clock, 
  Activity, 
  AlertCircle, 
  RotateCcw,
  RefreshCw,
  ShoppingBag,
  BellRing,
  Printer
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'ready' | 'completed' | 'rejected' | 'inventory'>('all');
  const [statusTimer, setStatusTimer] = useState<any>(null);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  // Dynamic menu items availability map from database reactive listens
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>({});

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [earningsResetTime, setEarningsResetTime] = useState<string | null>(() => {
    return localStorage.getItem('admin_earnings_reset_timestamp');
  });
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const handlePrintTicket = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=450,height=650');
    if (!printWindow) {
      alert('Please allow popups to compile thermal tickets.');
      return;
    }

    const itemsHtml = order.items.map(it => `
      <tr style="border-bottom: 1px dashed #DDD;">
        <td style="padding: 8px 0; font-size: 14px;"><strong>${it.quantity}x</strong> ${it.name}</td>
        <td style="padding: 8px 0; text-align: right; font-size: 14px; font-family: monospace;">₹${it.price * it.quantity}</td>
      </tr>
    `).join('');

    const allergySection = order.allergyNotes ? `
      <div style="border: 2px solid #FF3B30; padding: 12px; margin: 15px 0; background-color: #FFECEB; border-radius: 4px;">
        <h3 style="margin: 0 0 6px 0; font-size: 14px; color: #D1251B; font-family: sans-serif; letter-spacing: 0.5px; font-weight: bold;">⚠️ CRITICAL ALLERGY INFO</h3>
        <p style="margin: 0; font-size: 13px; font-weight: bold; color: #85100A; font-family: sans-serif;">${order.allergyNotes}</p>
      </div>
    ` : '';

    const kitchenNotesSection = order.notes ? `
      <div style="border: 1px solid #333; padding: 10px; margin: 15px 0; border-radius: 4px; background-color: #F8F9FA;">
        <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #333; font-family: sans-serif; font-weight: bold;">🍳 CHEF KITCHEN INSTRUCTIONS:</h4>
        <p style="margin: 0; font-size: 13px; font-family: sans-serif; line-height: 1.4; color: #111;">${order.notes}</p>
      </div>
    ` : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>LCC Ticket - #${order.id?.substring(0, 8).toUpperCase()}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 24px;
              color: #000;
              background: #fff;
              max-width: 400px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 16px;
              margin-bottom: 16px;
            }
            .header h1 {
              font-size: 21px;
              margin: 0 0 6px 0;
              font-weight: bold;
              letter-spacing: 0.5px;
            }
            .header p {
              margin: 3px 0;
              font-size: 12px;
            }
            .details {
              font-size: 13px;
              margin-bottom: 16px;
              line-height: 1.5;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
            }
            .footer {
              border-top: 2px dashed #000;
              padding-top: 16px;
              text-align: center;
              font-size: 12px;
              margin-top: 24px;
              color: #444;
            }
            @media print {
              body { padding: 10px; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LAZIZ CHICKEN CORNER</h1>
            <p>Sironj High-crunch Street Food</p>
            <p style="font-weight: bold; font-size: 15px; margin-top: 8px; border: 1px solid #000; display: inline-block; padding: 4px 10px;">
              KITCHEN TICKET #${order.id?.substring(0, 8).toUpperCase() || 'SANDBOX'}
            </p>
          </div>

          <div class="details">
            <strong>Customer:</strong> ${order.customerName}<br />
            <strong>Contact Cell:</strong> ${order.phone}<br />
            <strong>Pickup Goal:</strong> ${order.pickupTime}<br />
            ${order.estimatedPrepTime ? `<strong>Estimated Prep:</strong> ${order.estimatedPrepTime}<br />` : ''}
            <strong>Ticket Born:</strong> ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br />
          </div>

          ${allergySection}
          ${kitchenNotesSection}

          <table>
            <thead>
              <tr style="border-bottom: 2px solid #000;">
                <th style="text-align: left; padding-bottom: 8px; font-size: 12px;">ITEM</th>
                <th style="text-align: right; padding-bottom: 8px; font-size: 12px;">PRICE</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: right; font-size: 16px; font-weight: bold; margin-top: 12px; border-top: 1px solid #000; padding-top: 8px;">
            BALANCE DUE: ₹${order.totalPrice}
          </div>

          <div class="footer">
            <p>*** KITCHEN OPERATIONS ***</p>
            <p>Near Nanni Bee Masjid, Sironj</p>
            <p style="font-size: 10px; margin-top: 10px; color: #888;">Ingressed via Sovereign Live Admin Panel</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Preparation Estimates per Pending Order state maps
  const [selectedPrepTimes, setSelectedPrepTimes] = useState<Record<string, string>>({});
  const [customPrepTimes, setCustomPrepTimes] = useState<Record<string, string>>({});

  // Load orders with admin subscription
  useEffect(() => {
    setLoading(true);
    const unsubscribe = dbService.subscribeOrders(null, true, (incomingOrders) => {
      setOrders(incomingOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Synchronize dynamic menu availability changes reactively
  useEffect(() => {
    const unsubscribe = dbService.subscribeMenuItems((map) => {
      setAvailabilityMap(map);
    });
    return () => unsubscribe();
  }, []);

  // Reset bulk delete confirmation when modal is closed
  useEffect(() => {
    if (!showResetDialog) {
      setConfirmBulkDelete(false);
    }
  }, [showResetDialog]);

  // Action flow with custom fields support
  const handleTransitionWithPrep = async (orderId: string, prepTime: string) => {
    try {
      await dbService.updateOrderStatus(orderId, 'accepted', { estimatedPrepTime: prepTime });
    } catch (e) {
      console.error(e);
      alert('Failed to update order status on the database server');
    }
  };

  // Action flow transitions
  const handleTransition = async (orderId: string, currentStatus: OrderStatus, action: 'accept' | 'ready' | 'complete' | 'reject') => {
    let targetStatus: OrderStatus = 'pending';
    if (action === 'accept') targetStatus = 'accepted';
    if (action === 'ready') targetStatus = 'ready';
    if (action === 'complete') targetStatus = 'completed';
    if (action === 'reject') targetStatus = 'rejected';

    try {
      await dbService.updateOrderStatus(orderId, targetStatus);
    } catch (e) {
      console.error(e);
      alert('Failed to update status on server.');
    }
  };

  const handleDelete = async (orderId: string) => {
    try {
      await dbService.deleteOrder(orderId);
      showToast('Order record permanently deleted!', 'success');
      setConfirmDeleteOrderId(null);
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Error deleting order record', 'error');
    }
  };

  // Metrics calcs
  const pendingOrders = orders.filter(o => o.orderStatus === 'pending');
  const acceptedOrders = orders.filter(o => o.orderStatus === 'accepted');
  const readyOrders = orders.filter(o => o.orderStatus === 'ready');
  const rejectedOrders = orders.filter(o => o.orderStatus === 'rejected');

  // Filter completed orders depending on local shift reset timestamp
  const completedForEarnings = orders.filter(o => {
    if (o.orderStatus !== 'completed') return false;
    if (earningsResetTime) {
      const orderTime = o.createdAt ? new Date(o.createdAt).getTime() : 0;
      const resetTime = new Date(earningsResetTime).getTime();
      return orderTime > resetTime;
    }
    return true;
  });

  const finishedOrders = completedForEarnings;

  const totalRevenue = completedForEarnings.reduce((acc, curr) => acc + curr.totalPrice, 0);

  // Dynamic D3-style Cumulative revenue time progression geometry model
  const sortedCompleted = [...completedForEarnings]
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aTime - bTime;
    });

  let runningTotalValue = 0;
  const chartPoints = sortedCompleted.map((o) => {
    runningTotalValue += o.totalPrice;
    const dateObj = o.createdAt ? new Date(o.createdAt) : new Date();
    const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      label: formattedTime,
      val: runningTotalValue,
      price: o.totalPrice,
      customer: o.customerName
    };
  });

  const finalPoints = chartPoints.length > 0 
    ? [{ label: '00:00', val: 0, price: 0, customer: 'Store Open' }, ...chartPoints] 
    : [];

  const width = 1000;
  const height = 180;
  const paddingX = 50;
  const paddingY = 24;

  const maxVal = Math.max(...finalPoints.map(p => p.val), 500);

  const coordinates = finalPoints.map((p, i) => {
    const x = finalPoints.length > 1 
      ? paddingX + (i / (finalPoints.length - 1)) * (width - 2 * paddingX)
      : width / 2;
    const y = height - paddingY - (p.val / maxVal) * (height - 2 * paddingY);
    return { x, y, label: p.label, val: p.val, price: p.price, customer: p.customer };
  });

  let linePath = '';
  let areaPath = '';

  if (coordinates.length > 1) {
    linePath = `M ${coordinates[0].x} ${coordinates[0].y} ` + coordinates.slice(1).map(c => `L ${c.x} ${c.y}`).join(' ');
    areaPath = linePath + ` L ${coordinates[coordinates.length - 1].x} ${height - paddingY} L ${coordinates[0].x} ${height - paddingY} Z`;
  }

  // Filter orders by active selected tab
  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    return o.orderStatus === activeTab;
  });

  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-flame-orange/15 border border-flame-orange/40 text-flame-orange';
      case 'accepted': return 'bg-flame-yellow/15 border border-flame-yellow/40 text-flame-yellow';
      case 'ready': return 'bg-green-500/15 border border-green-500/40 text-green-400';
      case 'completed': return 'bg-zinc-800 border border-zinc-700 text-flame-gray';
      case 'rejected': return 'bg-red-500/15 border border-red-500/40 text-red-500';
      default: return 'bg-zinc-800 text-white';
    }
  };

  return (
    <div className="bg-flame-dark min-h-screen py-10 px-4 md:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <LCCLogo size="custom" className="w-20 h-16 shrink-0" glow={true} />
            <div>
              <div className="flex items-center gap-2 text-flame-orange mb-1">
                <span className="font-mono text-xs uppercase tracking-widest font-bold">LAZIZ CHICKEN CORNER</span>
              </div>
              <h1 className="font-display text-3xl md:text-5xl text-white">
                ADMIN <span className="text-flame-orange">ORDER</span> CONTROL
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('sandbox-orders-update'))}
              className="p-2.5 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-full text-flame-gray hover:text-white transition-colors cursor-pointer"
              title="Manual refresh"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={onClose}
              className="bg-flame-orange hover:bg-flame-deep text-white font-accent text-sm uppercase tracking-wide px-5 py-2.5 rounded transition-all cursor-pointer"
            >
              Back To Storefront
            </button>
          </div>
        </div>

        {/* Rapid Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="bg-flame-card border border-white/5 p-5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-flame-gray font-mono uppercase tracking-wider block">Income Done</span>
              <span className="font-mono text-2xl font-bold text-white block mt-1">₹{totalRevenue}</span>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-sm bg-green-500/15 border border-green-500/30 text-green-400 font-mono font-bold px-2 py-0.5 rounded">INR</span>
              <button
                type="button"
                onClick={() => setShowResetDialog(true)}
                className="text-[9px] font-mono uppercase tracking-widest text-flame-orange hover:text-white font-black bg-flame-orange/10 border border-flame-orange/20 hover:bg-flame-orange/20 px-2 py-1 rounded transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="bg-flame-card border border-white/5 p-5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-flame-orange font-mono uppercase tracking-wider block">Pending Queue</span>
              <span className="font-mono text-2xl font-bold text-flame-orange block mt-1">{pendingOrders.length}</span>
            </div>
            <Flame className="w-5 h-5 text-flame-orange animate-bounce" />
          </div>

          <div className="bg-flame-card border border-white/5 p-5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-flame-yellow font-mono uppercase tracking-wider block">In Kitchen</span>
              <span className="font-mono text-2xl font-bold text-flame-yellow block mt-1">{acceptedOrders.length}</span>
            </div>
            <ChefHat className="w-5 h-5 text-flame-yellow" />
          </div>

          <div className="bg-flame-card border border-white/5 p-5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-green-400 font-mono uppercase tracking-wider block">Ready For Pickup</span>
              <span className="font-mono text-2xl font-bold text-green-400 block mt-1">{readyOrders.length}</span>
            </div>
            <ShoppingBag className="w-5 h-5 text-green-400" />
          </div>

          <div className="col-span-2 lg:col-span-1 bg-flame-card border border-white/5 p-5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-flame-gray font-mono uppercase tracking-wider block">Finished Today</span>
              <span className="font-mono text-2xl font-bold text-white block mt-1">{finishedOrders.length}</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-flame-gray" />
          </div>

        </div>

        {/* Real-time Revenue & Sales Progression Chart */}
        <div className="bg-flame-black/40 border border-white/5 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-flame-orange/2 px-1 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
            <div>
              <span className="font-mono text-[9px] text-flame-orange uppercase tracking-widest font-black flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-flame-orange animate-pulse" />
                Live Revenue Progression (Today)
              </span>
              <h2 className="font-display text-xl text-white uppercase tracking-wider mt-1">Total Completed Income Chart</h2>
            </div>
            <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-flame-orange" />
                <span className="text-zinc-400">Total Income:</span>
                <strong className="text-white text-xs">₹{totalRevenue}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-zinc-400 font-medium">Completed:</span>
                <strong className="text-white text-xs font-bold">{finishedOrders.length} ticket(s)</strong>
              </div>
            </div>
          </div>

          <div className="relative w-full overflow-hidden mt-2">
            {finalPoints.length <= 1 ? (
              <div className="flex flex-col items-center justify-center text-center bg-zinc-950/40 border border-white/5 rounded-lg py-12 px-4">
                <span className="text-flame-gray font-mono text-[10px] uppercase tracking-widest font-bold">No Completed Tickets Today</span>
                <span className="text-[10px] text-zinc-600 mt-1 font-sans">Once an order's status is updated to 'completed' by clicking collected, this line graph will plot progression live.</span>
              </div>
            ) : (
              <>
                {hoveredPointIdx !== null && coordinates[hoveredPointIdx] && (
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-[#121214] border border-flame-orange/30 px-3.5 py-2 rounded shadow-2xl flex items-center gap-5 font-mono text-[9px] uppercase tracking-wider select-none text-white pointer-events-none z-10 animate-[fadeIn_0.2s_ease-out]">
                    <div>
                      <span className="text-zinc-500 block">Time</span>
                      <strong className="text-white font-bold">{coordinates[hoveredPointIdx].label}</strong>
                    </div>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div>
                      <span className="text-zinc-500 block">Ticket Amount</span>
                      <strong className="text-flame-orange font-bold">₹{coordinates[hoveredPointIdx].price}</strong>
                    </div>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div>
                      <span className="text-zinc-500 block">Cumulative Income</span>
                      <strong className="text-flame-yellow font-bold">₹{coordinates[hoveredPointIdx].val}</strong>
                    </div>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div>
                      <span className="text-zinc-500 block">Client</span>
                      <strong className="text-white font-bold">{coordinates[hoveredPointIdx].customer}</strong>
                    </div>
                  </div>
                )}

                <div className="w-full">
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none pointer-events-auto">
                    <defs>
                      <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.00" />
                      </linearGradient>
                      <linearGradient id="revenueLineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#FF6B00" />
                        <stop offset="50%" stopColor="#FFA000" />
                        <stop offset="100%" stopColor="#FF6B00" />
                      </linearGradient>
                    </defs>

                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                      const lineY = paddingY + ratio * (height - 2 * paddingY);
                      const gridVal = Math.round(maxVal * (1 - ratio));
                      return (
                        <g key={idx}>
                          <line 
                            x1={paddingX} 
                            y1={lineY} 
                            x2={width - paddingX} 
                            y2={lineY} 
                            stroke="rgba(255,255,255,0.03)" 
                            strokeDasharray="4 4" 
                          />
                          <text 
                            x={paddingX - 10} 
                            y={lineY + 3} 
                            fill="rgba(255,255,255,0.25)" 
                            textAnchor="end" 
                            className="font-mono text-[9px]"
                          >
                            ₹{gridVal}
                          </text>
                        </g>
                      );
                    })}

                    {areaPath && (
                      <path d={areaPath} fill="url(#revenueAreaGrad)" />
                    )}

                    {linePath && (
                      <path 
                        d={linePath} 
                        fill="none" 
                        stroke="url(#revenueLineGrad)" 
                        strokeWidth="2.5" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {coordinates.map((c, idx) => (
                      <g 
                        key={idx}
                        onMouseEnter={() => setHoveredPointIdx(idx)}
                        onMouseLeave={() => setHoveredPointIdx(null)}
                        className="cursor-pointer"
                      >
                        <circle 
                          cx={c.x} 
                          cy={c.y} 
                          r="16" 
                          fill="transparent" 
                        />
                        
                        <circle 
                          cx={c.x} 
                          cy={c.y} 
                          r={hoveredPointIdx === idx ? "8" : "4"} 
                          fill="#FF6B00" 
                          className="transition-all duration-200"
                          opacity={hoveredPointIdx === idx ? "0.4" : "0"} 
                        />

                        <circle 
                          cx={c.x} 
                          cy={c.y} 
                          r={hoveredPointIdx === idx ? "4.5" : "3"} 
                          fill={hoveredPointIdx === idx ? "#FFA000" : "#FF6B00"} 
                          stroke="#121214"
                          strokeWidth="1.5"
                          className="transition-all duration-200"
                        />

                        {hoveredPointIdx === idx && (
                          <line 
                            x1={c.x} 
                            y1={paddingY} 
                            x2={c.x} 
                            y2={height - paddingY} 
                            stroke="#FF6B00" 
                            strokeOpacity="0.25" 
                            strokeDasharray="2 2" 
                            pointerEvents="none"
                          />
                        )}

                        {(idx === 0 || idx === coordinates.length - 1 || (coordinates.length > 5 && idx % Math.floor(coordinates.length / 4) === 0)) && (
                          <text 
                            x={c.x} 
                            y={height - 6} 
                            fill="rgba(255,255,255,0.4)" 
                            textAnchor="middle" 
                            className="font-mono text-[8px]"
                          >
                            {c.label}
                          </text>
                        )}
                      </g>
                    ))}
                  </svg>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tab Selector Filters */}
        <div className="flex items-center gap-2 border-b border-white/5 pb-1 overflow-x-auto no-scrollbar select-none">
          {(['all', 'pending', 'accepted', 'ready', 'completed', 'rejected', 'inventory'] as const).map((tab) => {
            const count = 
              tab === 'inventory' ? INITIAL_MENU_ITEMS.length :
              tab === 'all' ? orders.length :
              tab === 'pending' ? pendingOrders.length :
              tab === 'accepted' ? acceptedOrders.length :
              tab === 'ready' ? readyOrders.length :
              tab === 'completed' ? finishedOrders.length :
              rejectedOrders.length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-5 font-accent text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab 
                    ? 'border-flame-orange text-flame-orange font-bold' 
                    : 'border-transparent text-flame-gray hover:text-white'
                }`}
              >
                {tab === 'inventory' ? '🍽️ Menu Inventory' : tab} ({count})
              </button>
            );
          })}
        </div>

        {/* Loading segment */}
        {loading ? (
          <div className="text-center py-20 bg-flame-card rounded-lg border border-white/5">
            <RefreshCw className="w-8 h-8 text-flame-orange animate-spin mx-auto mb-3" />
            <p className="text-xs text-flame-gray font-mono uppercase tracking-widest">Listening Live Orders...</p>
          </div>
        ) : activeTab === 'inventory' ? (
          /* Menu Items Availability Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
            {INITIAL_MENU_ITEMS.map((item) => {
              const isAvailable = item.id in availabilityMap ? availabilityMap[item.id] : item.isAvailable;
              return (
                <div key={item.id} className="bg-flame-card border border-white/5 p-5 rounded-xl flex flex-col justify-between hover:border-white/10 transition-all select-none">
                  <div className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-zinc-900 border border-white/10 shrink-0" referrerPolicy="no-referrer" />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-flame-yellow bg-flame-yellow/10 border border-flame-yellow/20 px-1.5 py-0.5 rounded font-black">{item.category}</span>
                        <span className="font-mono text-[9px] text-[#A0A0A0]">₹{item.price}</span>
                      </div>
                      <h4 className="font-display text-sm text-white uppercase tracking-wider leading-snug">{item.name}</h4>
                      <p className="text-[10px] text-flame-gray line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                      <span className={isAvailable ? 'text-green-400 font-bold font-mono text-[11px]' : 'text-zinc-500 font-bold font-mono text-[11px]'}>{isAvailable ? 'AVAILABLE' : 'SOLD OUT'}</span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await dbService.updateMenuItemAvailability(item, !isAvailable);
                          showToast(`Marked ${item.name} as ${!isAvailable ? 'Available' : 'Sold Out'}`, 'success');
                        } catch (e) {
                          showToast(`Database transaction error!`, 'error');
                        }
                      }}
                      className={`px-3 py-1.5 font-accent text-[10px] uppercase rounded font-bold cursor-pointer hover:scale-103 transition-all select-none ${
                        isAvailable 
                          ? 'bg-zinc-850 text-red-400 hover:bg-zinc-800 hover:text-red-300 border border-red-500/10' 
                          : 'bg-flame-orange hover:bg-flame-deep text-white shadow-sm shadow-flame-orange/20'
                      }`}
                    >
                      {isAvailable ? 'Toggle Sold Out' : 'Toggle Available'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-flame-card rounded-lg border border-white/10 flex flex-col items-center">
            <BellRing className="w-12 h-12 text-zinc-700 mb-3" />
            <p className="font-accent text-lg text-white uppercase tracking-wider">No Orders In This Stage</p>
            <p className="text-xs text-flame-gray mt-1">Ready to receive live orders from customers at any time.</p>
          </div>
        ) : (
          /* Cards Grid list */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div 
                key={order.id} 
                className={`bg-flame-card border border-white/5 hover:border-white/10 p-6 rounded-xl flex flex-col justify-between transition-all duration-300 relative ${
                  order.orderStatus === 'pending' ? 'ring-1 ring-flame-orange/20' : ''
                }`}
              >
                {/* Floating Status and Order ID info */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] text-flame-gray uppercase">
                    ID: #{order.id?.substring(0, 10) || 'sim'}
                  </span>
                  <span className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase font-black ${getStatusClass(order.orderStatus)}`}>
                    ● {order.orderStatus}
                  </span>
                </div>

                {/* Customer Identity detail */}
                <div className="border-b border-white/5 pb-4 mb-4">
                  <h3 className="font-accent text-lg text-white uppercase tracking-wider">{order.customerName}</h3>
                  <a href={`tel:${order.phone}`} className="block font-mono text-xs text-flame-yellow mt-1 hover:underline">
                    📞 {order.phone}
                  </a>
                  <p className="text-xs text-white/90 font-sans mt-3 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-flame-orange" />
                    <span>Pickup requested: <strong className="text-white bg-zinc-800 border border-white/10 px-1.5 py-0.5 rounded font-mono text-[10px]">{order.pickupTime}</strong></span>
                  </p>
                  {order.estimatedPrepTime && (
                    <p className="text-xs text-flame-yellow mt-2 flex items-center gap-1.5 bg-flame-yellow/5 border border-flame-yellow/15 px-2.5 py-1.5 rounded-md font-sans">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Prep time: <strong className="text-white font-mono font-bold">{order.estimatedPrepTime}</strong></span>
                    </p>
                  )}
                </div>

                {/* Items collection */}
                <div className="flex-1 space-y-2 mb-6">
                  <span className="font-mono text-[9px] text-flame-gray uppercase tracking-widest block">Ordered Items</span>
                  <div className="max-h-36 overflow-y-auto space-y-1 my-1 pr-1 border border-white/5 rounded-md p-2 bg-black/20">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-baseline text-xs text-white/90">
                        <span className="font-sans leading-snug tracking-wide">
                          <strong className="text-flame-orange font-mono">{it.quantity}x</strong> {it.name}
                        </span>
                        <span className="font-mono text-flame-gray ml-2 shrink-0">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="bg-flame-yellow/5 border border-flame-yellow/15 p-2.5 rounded text-[10px] text-flame-yellow leading-relaxed font-sans mb-1.5">
                      ✍️ <strong>Chef Note:</strong> {order.notes}
                    </div>
                  )}

                  {order.allergyNotes && (
                    <div className="bg-red-950/20 border border-red-600/35 p-2.5 rounded text-[10px] text-red-400 font-sans leading-relaxed mb-3 animate-pulse">
                      ⚠️ <strong className="text-red-500 font-extrabold uppercase">Allergy Warning:</strong> {order.allergyNotes}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-white pt-2 border-t border-white/5">
                    <span className="font-accent text-xs uppercase tracking-wide">Total Price Due</span>
                    <strong className="font-mono text-base text-flame-orange">₹{order.totalPrice}</strong>
                  </div>
                </div>

                {/* Action panel triggers based on State transitions */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {order.orderStatus === 'pending' && (
                    <div className="col-span-2 space-y-3 bg-black/40 border border-white/5 p-3 rounded-lg my-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-flame-gray flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-flame-orange animate-pulse" />
                          Specify Prep Time:
                        </span>
                        <span className="font-mono text-xs text-flame-yellow font-black">
                          {selectedPrepTimes[order.id!] || '20 mins'}
                        </span>
                      </div>
                      
                      {/* Presets Grid */}
                      <div className="grid grid-cols-5 gap-1.5">
                        {['15 mins', '20 mins', '30 mins', '45 mins', '60 mins'].map((time) => {
                          const isSelected = (selectedPrepTimes[order.id!] || '20 mins') === time;
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedPrepTimes(prev => ({ ...prev, [order.id!]: time }))}
                              className={`text-[10px] font-mono py-1 rounded-md transition-all font-bold cursor-pointer border ${
                                isSelected
                                  ? 'bg-flame-orange border-flame-orange text-black'
                                  : 'bg-[#18181B] border-white/5 hover:border-white/15 text-flame-gray hover:text-white'
                              }`}
                            >
                              {time.split(' ')[0]}m
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom input */}
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-flame-gray uppercase tracking-wider">Custom:</span>
                        <input
                          type="text"
                          placeholder="e.g., 25 mins or Live"
                          value={customPrepTimes[order.id!] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomPrepTimes(prev => ({ ...prev, [order.id!]: val }));
                            setSelectedPrepTimes(prev => ({ ...prev, [order.id!]: val || '20 mins' }));
                          }}
                          className="flex-1 bg-[#121212] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-flame-orange font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => {
                            const chosenTime = selectedPrepTimes[order.id!] || '20 mins';
                            handleTransitionWithPrep(order.id!, chosenTime);
                          }}
                          className="bg-flame-orange hover:bg-flame-deep text-black text-[10px] uppercase font-accent font-black tracking-wider py-2.5 rounded transition-transform active:scale-95 cursor-pointer text-center"
                        >
                          Accept to Oven
                        </button>
                        <button
                          onClick={() => handleTransition(order.id!, order.orderStatus, 'reject')}
                          className="bg-zinc-800 hover:bg-red-950/45 text-red-400 border border-white/10 text-[10px] uppercase font-accent font-bold tracking-wider py-2 rounded transition-colors cursor-pointer text-center"
                        >
                          Reject Order
                        </button>
                      </div>
                    </div>
                  )}

                  {order.orderStatus === 'accepted' && (
                    <div className="col-span-2 space-y-3">
                      {/* Active prep display and modification capability */}
                      <div className="bg-[#1C1612]/80 border border-flame-orange/20 px-3 py-2 rounded-lg flex items-center justify-between text-xs font-mono">
                        <span className="flex items-center gap-1.5 text-flame-yellow">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>Prep Left: <strong className="text-white font-bold">{order.estimatedPrepTime || '20 mins'}</strong></span>
                        </span>
                        <button
                          onClick={async () => {
                            const val = prompt("Enter new estimated preparation time (e.g. 15 mins):", order.estimatedPrepTime || "20 mins");
                            if (val !== null) {
                              try {
                                await dbService.updateOrderStatus(order.id!, 'accepted', { estimatedPrepTime: val });
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                          className="text-[10px] text-flame-orange uppercase font-black tracking-wider hover:underline cursor-pointer"
                        >
                          Reschedule
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleTransition(order.id!, order.orderStatus, 'ready')}
                          className="bg-flame-yellow text-flame-black hover:bg-yellow-500 font-extrabold text-[10px] uppercase font-accent tracking-wider py-2 rounded transition-colors cursor-pointer text-center"
                        >
                          Ready For Counter
                        </button>
                        <button
                          onClick={() => handleTransition(order.id!, order.orderStatus, 'reject')}
                          className="bg-zinc-800 hover:bg-red-950/40 text-red-500 border border-white/10 text-[10px] uppercase font-accent tracking-wider py-2 rounded transition-colors cursor-pointer text-center"
                        >
                          Reject Order
                        </button>
                      </div>

                      {/* Print Ticket Action */}
                      <button
                        onClick={() => handlePrintTicket(order)}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white hover:text-flame-orange hover:border-flame-orange/40 text-[10px] font-accent uppercase tracking-wider py-2 rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Kitchen Ticket</span>
                      </button>
                    </div>
                  )}

                  {order.orderStatus === 'ready' && (
                    <>
                      <button
                        onClick={() => handleTransition(order.id!, order.orderStatus, 'complete')}
                        className="col-span-2 bg-green-500 hover:bg-green-600 text-flame-black font-extrabold text-[10px] uppercase font-accent tracking-widest py-2.5 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Collected (Close)</span>
                      </button>
                    </>
                  )}

                  {(order.orderStatus === 'completed' || order.orderStatus === 'rejected') && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirmDeleteOrderId === order.id) {
                          handleDelete(order.id!);
                        } else {
                          setConfirmDeleteOrderId(order.id);
                          setTimeout(() => setConfirmDeleteOrderId(current => current === order.id ? null : current), 4000);
                        }
                      }}
                      className={`col-span-2 text-[10px] uppercase font-accent tracking-widest py-2 rounded transition-all font-black flex items-center justify-center gap-1.5 cursor-pointer border ${
                        confirmDeleteOrderId === order.id
                          ? "bg-red-600 border-red-500 text-white animate-pulse"
                          : "bg-red-950/10 hover:bg-red-950/30 text-red-400 border-red-950/30"
                      }`}
                      title={confirmDeleteOrderId === order.id ? "Click again to confirm delete" : "Delete permanent record"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{confirmDeleteOrderId === order.id ? "Click to Confirm" : "Delete Document"}</span>
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Earning Reset modal context */}
        {showResetDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
            <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl max-w-md w-full space-y-6 shadow-2xl relative">
              <button 
                onClick={() => setShowResetDialog(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
              
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-flame-orange/10 border border-flame-orange/20 flex items-center justify-center text-flame-orange">
                  <RotateCcw className="w-6 h-6 animate-[spin_4s_linear_infinite]" />
                </div>
                <h3 className="font-display text-xl text-white uppercase tracking-wider">
                  Reset Administrative Earnings
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Resetting earnings allows you to clear the daily dashboard total revenue back to <strong className="text-white">₹0</strong> to begin a new kitchen shift. Please choose your preferred reset method:
                </p>
              </div>

              <div className="space-y-3 font-sans">
                {/* Method 1: Local Shift Reset */}
                <button
                  type="button"
                  onClick={() => {
                    const nowIso = new Date().toISOString();
                    localStorage.setItem('admin_earnings_reset_timestamp', nowIso);
                    setEarningsResetTime(nowIso);
                    setShowResetDialog(false);
                    showToast('Earning counters reset locally for current shift!', 'success');
                  }}
                  className="w-full text-left p-4 rounded-xl border border-white/5 hover:border-flame-orange/30 bg-white/[0.02] hover:bg-flame-orange/[0.02] transition-all flex justify-between items-center group cursor-pointer"
                >
                  <div className="space-y-1">
                    <span className="font-accent text-xs font-bold text-white uppercase tracking-wide group-hover:text-flame-orange block">
                      ⏱️ Reset Counters Only (Preserve History)
                    </span>
                    <span className="text-[10px] text-zinc-500 block leading-snug">
                      Hides all previous completed orders in local dashboard revenue calculations. Preserves database records.
                    </span>
                  </div>
                </button>

                 {/* Method 2: Permanent Database deletion */}
                 <button
                   type="button"
                   onClick={async () => {
                     if (!confirmBulkDelete) {
                       setConfirmBulkDelete(true);
                       return;
                     }
                     try {
                       const completedOrders = orders.filter(o => o.orderStatus === 'completed');
                       if (completedOrders.length === 0) {
                         showToast('No completed orders in database to delete.', 'info');
                         setConfirmBulkDelete(false);
                         setShowResetDialog(false);
                         return;
                       }
                       
                       let deletedCount = 0;
                       for (const order of completedOrders) {
                         if (order.id) {
                           await dbService.deleteOrder(order.id);
                           deletedCount++;
                         }
                       }
                       
                       // Also clear any local reset timestamp since DB is empty
                       localStorage.removeItem('admin_earnings_reset_timestamp');
                       setEarningsResetTime(null);
                       setConfirmBulkDelete(false);
                       setShowResetDialog(false);
                       showToast(`Successfully deleted ${deletedCount} completed order records!`, 'success');
                     } catch (err) {
                       console.error(err);
                       showToast('Error executing bulk delete operation.', 'error');
                       setConfirmBulkDelete(false);
                     }
                   }}
                   className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center group cursor-pointer ${
                     confirmBulkDelete 
                       ? "border-red-500 bg-red-950/20 text-white animate-[pulse_2s_infinite]" 
                       : "border-red-500/10 hover:border-red-500/45 bg-red-500/[0.01] hover:bg-red-500/[0.03]"
                   }`}
                 >
                   <div className="space-y-1">
                     <span className={`font-accent text-xs font-bold uppercase tracking-wide block ${
                       confirmBulkDelete ? "text-red-300" : "text-red-400 group-hover:text-red-300"
                     }`}>
                       {confirmBulkDelete ? "🚨 CLICK TO CONFIRM ALL DELETIONS!" : "⚠️ Delete Completed Orders (Database Reset)"}
                     </span>
                     <span className="text-[10px] text-zinc-500 block leading-snug">
                       {confirmBulkDelete ? "Are you sure? This permanently wipes and resolves all completed orders from Firebase cloud storage!" : "Permanently wipes all completed order documents from Firestore database storage to clear the logs."}
                     </span>
                   </div>
                 </button>

                {earningsResetTime && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('admin_earnings_reset_timestamp');
                      setEarningsResetTime(null);
                      setShowResetDialog(false);
                      showToast('Shipped historical counters restored!', 'success');
                    }}
                    className="w-full text-center py-2 text-[10px] font-mono text-zinc-500 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    ↩ Restore All Historical Records (Undo Local Reset)
                  </button>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowResetDialog(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-accent text-xs uppercase tracking-wide rounded cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
