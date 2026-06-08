import { useState, useEffect, useRef } from 'react';
import { dbService } from '../firebase';
import { Order, OrderStatus } from '../types';
import { 
  Flame, 
  Clock, 
  CheckCircle, 
  X, 
  ShoppingBag, 
  ClipboardCheck, 
  Search, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle 
} from 'lucide-react';

interface OrderHistoryProps {
  userId: string;
  onOrderStatusChange?: (order: Order, oldStatus: OrderStatus) => void;
}

export default function OrderHistory({ userId, onOrderStatusChange }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderID, setExpandedOrderID] = useState<string | null>(null);

  const prevOrdersRef = useRef<Order[]>([]);
  const onStatusChangeRef = useRef(onOrderStatusChange);

  useEffect(() => {
    onStatusChangeRef.current = onOrderStatusChange;
  }, [onOrderStatusChange]);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    // Realtime subscription to the specific user's orders
    const unsubscribe = dbService.subscribeOrders(userId, false, (incomingOrders) => {
      const prevOrders = prevOrdersRef.current;

      // Detect transitions when orders are updated (only after the initial load has fetched existing orders)
      if (prevOrders && prevOrders.length > 0) {
        incomingOrders.forEach((newOrder) => {
          const oldOrder = prevOrders.find(o => o.id === newOrder.id);
          if (oldOrder && oldOrder.orderStatus !== newOrder.orderStatus) {
            // Alert user if order status changes from 'pending' to 'accepted' or 'ready'
            if (oldOrder.orderStatus === 'pending' && (newOrder.orderStatus === 'accepted' || newOrder.orderStatus === 'ready')) {
              onStatusChangeRef.current?.(newOrder, oldOrder.orderStatus);
            }
          }
        });
      }

      prevOrdersRef.current = incomingOrders;
      setOrders(incomingOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const toggleExpandOrder = (id?: string) => {
    if (!id) return;
    setExpandedOrderID(prev => prev === id ? null : id);
  };

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending Chef Review' },
    { value: 'accepted', label: 'In Preparation' },
    { value: 'ready', label: 'Ready for Pickup' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Canceled / Rejected' }
  ];

  const getStatusLabelAndColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending Review', color: 'text-flame-orange bg-flame-orange/10 border-flame-orange/20' };
      case 'accepted':
        return { label: 'Preparing', color: 'text-flame-yellow bg-flame-yellow/10 border-flame-yellow/20 animate-pulse' };
      case 'ready':
        return { label: 'Ready: Collect At Counter!', color: 'text-green-400 bg-green-500/10 border-green-500/20' };
      case 'completed':
        return { label: 'Completed', color: 'text-zinc-400 bg-zinc-800/40 border-zinc-700/20' };
      case 'rejected':
        return { label: 'Canceled', color: 'text-red-400 bg-red-400/10 border-red-500/20' };
      default:
        return { label: 'Unknown', color: 'text-white border-white/10' };
    }
  };

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
        <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #333; font-family: sans-serif; font-weight: bold;">🍳 CUSTOMER REQUESTS:</h4>
        <p style="margin: 0; font-size: 13px; font-family: sans-serif; line-height: 1.4; color: #111;">${order.notes}</p>
      </div>
    ` : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>LCC Receipt - #${order.id?.substring(0, 8).toUpperCase()}</title>
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
              CUSTOMER RECEIPT #${order.id?.substring(0, 8).toUpperCase() || 'SANDBOX'}
            </p>
          </div>

          <div class="details">
            <strong>Customer:</strong> ${order.customerName}<br />
            <strong>Contact Phone:</strong> ${order.phone}<br />
            <strong>Pickup Time:</strong> ${order.pickupTime}<br />
            ${order.estimatedPrepTime ? `<strong>Estimated Prep:</strong> ${order.estimatedPrepTime}<br />` : ''}
            <strong>Date:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}<br />
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

          <div style="font-size: 13px; border-top: 1px dashed #DDD; padding-top: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Subtotal:</span>
              <span>₹${order.totalPrice}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>GST central levies (Promo):</span>
              <span style="color: green;">₹0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Pickup service charge:</span>
              <span style="color: green;">₹0.00</span>
            </div>
          </div>

          <div style="text-align: right; font-size: 16px; font-weight: bold; margin-top: 12px; border-top: 1px solid #000; padding-top: 8px;">
            TOTAL PAID (COUNTER): ₹${order.totalPrice}
          </div>

          <div class="footer">
            <p>*** THANK YOU FOR YOUR PATRONAGE ***! ***</p>
            <p>Near Nanni Bee Masjid, Sironj</p>
            <p style="font-size: 10px; margin-top: 10px; color: #888;">Ordered via Storefront Portal</p>
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

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(it => it.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.pickupTime.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="text-center py-16 flex flex-col items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-flame-orange border-t-transparent animate-spin"></span>
        <p className="font-mono text-xs uppercase tracking-widest text-flame-gray mt-4">Retrieving Store Receipts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtering Header Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search orders by item or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 pl-9 pr-4 py-2 rounded text-xs focus:outline-none focus:border-flame-orange"
            id="order-history-search"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-flame-gray" />
        </div>

        {/* Status Tab Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded text-xs focus:outline-none focus:border-flame-orange"
          id="order-status-filter"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-flame-card/40 border border-white/5 rounded-lg flex flex-col items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-zinc-700 mb-2" />
          <p className="font-accent text-base text-white uppercase tracking-wider">No matching transactions</p>
          <p className="text-xs text-flame-gray mt-1 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different status filter to locate past records.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusLabelAndColor(order.orderStatus);
            const isExpanded = expandedOrderID === order.id;

            return (
              <div 
                key={order.id} 
                className="bg-flame-card border border-white/5 rounded-lg overflow-hidden hover:border-flame-orange/20 transition-all duration-300"
              >
                {/* Header block (Clickable to Expand) */}
                <div 
                  onClick={() => toggleExpandOrder(order.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[2%] select-none"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-flame-gray uppercase">
                        #{order.id?.substring(0, 10).toUpperCase() || 'SANDBOX'}
                      </span>
                      <span className="font-mono text-[9px] text-[#A0A0A0]">
                        • {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>

                    <h4 className="font-accent text-base text-white uppercase tracking-wider">
                      ₹{order.totalPrice} • {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status badge pill */}
                    <div className={`px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 ${statusInfo.color}`}>
                      <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                      <span>{statusInfo.label}</span>
                    </div>

                    {isExpanded ? <ChevronUp className="w-4 h-4 text-flame-gray" /> : <ChevronDown className="w-4 h-4 text-flame-gray" />}
                  </div>
                </div>

                {/* Expanded Details Workspace */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-white/5 bg-black/20 space-y-4">
                    {/* Itemizations */}
                    <div className="space-y-1.5">
                      <span className="block text-[9px] text-flame-yellow font-mono uppercase tracking-widest">Ordered Items</span>
                      <div className="divide-y divide-white/5 bg-zinc-950/40 border border-white/5 p-3 rounded-lg space-y-2">
                        {order.items.map((it, itemIdx) => (
                          <div key={itemIdx} className="text-xs text-white/90 font-sans flex justify-between pt-2 first:pt-0 border-white/5">
                            <span>
                              <strong className="text-flame-orange font-mono font-bold">{it.quantity}x</strong> {it.name}
                            </span>
                            <span className="font-mono text-flame-gray">₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Breakdown Summary Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* Pick Details */}
                      <div className="space-y-2 text-xs font-sans text-flame-gray">
                        <div>
                          <span className="block text-[9px] text-flame-gray font-mono uppercase tracking-widest">Customer Details</span>
                          <span className="text-white block font-medium mt-0.5">{order.customerName} ({order.phone})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-flame-orange shrink-0" />
                          <span>Pickup Goal: <strong className="text-white">{order.pickupTime}</strong></span>
                        </div>
                        {order.notes && (
                          <p className="text-[11px] text-amber-500 bg-amber-500/5 px-2 py-1.5 rounded border border-amber-500/10">
                            <strong>Note:</strong> {order.notes}
                          </p>
                        )}
                        {order.allergyNotes && (
                          <p className="text-[11px] text-red-400 bg-red-400/5 px-2 py-1.5 rounded border border-red-500/20 font-bold">
                            ⚠️ <strong>Allergy Alert:</strong> {order.allergyNotes}
                          </p>
                        )}
                      </div>

                      {/* Math Summary & Ticket Action */}
                      <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-lg space-y-2 text-xs text-flame-gray">
                        <div className="flex justify-between">
                          <span>Subtotal Items Price:</span>
                          <span className="font-mono text-white">₹{order.totalPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST Central Levies:</span>
                          <span className="font-mono text-green-500 font-bold">₹0.00 (Promo)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pickup Svc Charge:</span>
                          <span className="font-mono text-green-500 font-bold">₹0.00 (Free)</span>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-2 uppercase font-bold text-white text-sm">
                          <span>Total Paid:</span>
                          <span className="font-mono text-flame-orange text-base font-black">₹{order.totalPrice}</span>
                        </div>

                        {/* Print Thermal Ticket */}
                        <button
                          onClick={() => handlePrintTicket(order)}
                          className="w-full flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-white bg-zinc-800 hover:bg-zinc-700 hover:text-flame-orange py-2 rounded transition-colors border border-white/5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Culinary Receipt</span>
                        </button>
                      </div>
                    </div>

                    {/* Chef Estimated Preparation box */}
                    {order.estimatedPrepTime && (order.orderStatus === 'accepted' || order.orderStatus === 'ready') && (
                      <div className="bg-flame-orange/10 border border-flame-orange/20 px-3.5 py-2.5 rounded-lg flex items-center gap-2.5 shadow-sm">
                        <Flame className="w-4 h-4 text-flame-orange animate-pulse" />
                        <span className="text-xs text-white font-sans leading-relaxed">
                          Kitchen staff estimated pickup preparation to complete in <strong className="text-flame-yellow font-mono text-xs">{order.estimatedPrepTime}</strong>. Please arrive on time!
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
