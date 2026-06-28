import React from 'react';
import { Package, CheckCircle2, Truck, Home, Clock, XCircle } from 'lucide-react';

const OrderTracking = ({ status, createdAt }) => {
  const steps = [
    { id: 'pending', label: 'Buyurtma qabul qilindi', icon: Clock, time: '0 daqiqa' },
    { id: 'processing', label: 'Tayyorlanmoqda', icon: Package, time: '1-2 soat' },
    { id: 'shipped', label: 'Yo\'lda', icon: Truck, time: '1-2 kun' },
    { id: 'delivered', label: 'Yetkazib berildi', icon: Home, time: '2-3 kun' }
  ];

  const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(status);

  if (status === 'cancelled') {
    return (
      <div className="p-6 bg-[#EF4444]/10 rounded-xl border border-[#EF4444]/20" data-testid="order-cancelled">
        <div className="flex items-center gap-3">
          <XCircle className="w-8 h-8 text-[#EF4444]" />
          <div>
            <p className="font-semibold text-[#EF4444]">Buyurtma bekor qilindi</p>
            <p className="text-sm text-[#475569] dark:text-gray-400">
              {new Date(createdAt).toLocaleDateString('uz-UZ')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-[#3B82F6]/5 to-[#0A2540]/5 rounded-xl border border-[#3B82F6]/20" data-testid="order-tracking">
      <h4 className="font-semibold text-[#0A2540] dark:text-white mb-6 flex items-center gap-2">
        <Truck className="w-5 h-5 text-[#3B82F6]" />
        Buyurtma kuzatuvi
      </h4>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#3B82F6] to-[#10B981] rounded-full transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const Icon = isCompleted ? CheckCircle2 : step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center flex-1" data-testid={`tracking-step-${step.id}`}>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all relative z-10 ${
                    isCompleted
                      ? 'bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/30'
                      : 'bg-gray-200 dark:bg-white/10 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-[#3B82F6]/20 animate-pulse' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p
                  className={`text-xs font-medium mt-2 text-center ${
                    isCompleted ? 'text-[#0A2540] dark:text-white' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-gray-400 mt-1">{step.time}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
