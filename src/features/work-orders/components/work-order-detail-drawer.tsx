'use client';

import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Drawer } from '@/components/ui/drawer';
import type { WorkOrder } from '@/features/work-orders/types';
import { formatCurrencyVnd, formatDateTime, statusLabel } from '@/features/work-orders/utils';

type Props = {
  open: boolean;
  order: WorkOrder | null;
  onClose: () => void;
  onSaveNotes: (id: string, notes: string) => Promise<void>;
};

function statusTone(status: WorkOrder['status']): string {
  if (status === 'IN_PROGRESS') return 'bg-info-100 text-info-800';
  if (status === 'COMPLETED') return 'bg-badge-success text-badge-success-text';
  if (status === 'WAITING_PARTS') return 'bg-warning-100 text-warning-800';
  if (status === 'READY_FOR_PAYMENT') return 'bg-primary-100 text-primary-800';
  if (status === 'CANCELLED') return 'bg-error-100 text-error-800';
  return 'bg-surface-hover text-text-secondary';
}

export function WorkOrderDetailDrawer({ open, order, onClose, onSaveNotes }: Props): JSX.Element | null {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (order) setNotes(order.notes || '');
  }, [order]);

  if (!order) return null;

  return (
    <Drawer open={open} onClose={onClose} title={order.orderCode} description={order.plateNumber} width="xl">
      <div className="space-y-s4">
        <Card className="p-s4">
          <Badge variant="default" className={statusTone(order.status)}>
            {statusLabel(order.status)}
          </Badge>
        </Card>

        <Card className="p-s4">
          <h4 className="text-small font-semibold">Customer Info</h4>
          <p className="mt-s2 text-small">
            {order.customerName} - {order.customerPhone}
          </p>
        </Card>

        <Card className="p-s4">
          <h4 className="text-small font-semibold">Service List</h4>
          <div className="mt-s3 space-y-s2">
            {order.services.map((service) => (
              <div key={service.id} className="flex justify-between text-small">
                <span>{service.name}</span>
                <span>{formatCurrencyVnd(service.price)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-s4">
          <h4 className="text-small font-semibold">Parts Used</h4>
          {order.parts.length ? (
            <div className="mt-s3 space-y-s2">
              {order.parts.map((part) => (
                <div key={part.id} className="flex justify-between text-small">
                  <span>
                    {part.partName} x{part.quantity}
                  </span>
                  <span>{formatCurrencyVnd(part.quantity * part.unitPrice)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-s2 text-small text-text-muted">No parts added.</p>
          )}
        </Card>

        <Card className="p-s4">
          <h4 className="text-small font-semibold">Worker Assignment</h4>
          <p className="mt-s2 text-small">{order.workerName || 'Unassigned'}</p>
        </Card>

        <Card className="p-s4">
          <h4 className="text-small font-semibold">Timeline</h4>
          <div className="mt-s3 space-y-s2">
            {order.timeline.map((event, idx) => (
              <div key={`${event.status}-${idx}`} className="flex items-center justify-between text-small">
                <span>{statusLabel(event.status)}</span>
                <span className="text-text-muted">{formatDateTime(event.timestamp)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-s4">
          <h4 className="text-small font-semibold">Payment Summary</h4>
          <div className="mt-s3 space-y-s2 text-small">
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-semibold">{formatCurrencyVnd(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method</span>
              <span>{order.paymentMethod || '-'}</span>
            </div>
          </div>
        </Card>

        <Card className="p-s4">
          <h4 className="text-small font-semibold">Notes</h4>
          <textarea
            className="mt-s2 min-h-[96px] w-full rounded-md border border-input-border bg-input px-s3 py-s2 text-small"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="mt-s2 flex justify-end">
            <Button size="sm" onClick={() => void onSaveNotes(order.id, notes)}>
              Save Notes
            </Button>
          </div>
        </Card>
      </div>
    </Drawer>
  );
}
