import { Card } from "@/components/ui/card";
import { ArrowDown, Users, PhoneCall, Calendar, CheckCircle } from "lucide-react";

interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  icon: any;
  color: string;
}

interface SalesFunnelProps {
  leads: number;
  contacted: number;
  scheduled: number;
  converted: number;
}

export const SalesFunnel = ({ leads, contacted, scheduled, converted }: SalesFunnelProps) => {
  const stages: FunnelStage[] = [
    {
      name: "Leads Gerados",
      count: leads,
      percentage: 100,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      name: "Contactados",
      count: contacted,
      percentage: leads > 0 ? (contacted / leads) * 100 : 0,
      icon: PhoneCall,
      color: "bg-purple-500",
    },
    {
      name: "Agendamentos",
      count: scheduled,
      percentage: leads > 0 ? (scheduled / leads) * 100 : 0,
      icon: Calendar,
      color: "bg-orange-500",
    },
    {
      name: "Conversões",
      count: converted,
      percentage: leads > 0 ? (converted / leads) * 100 : 0,
      icon: CheckCircle,
      color: "bg-green-500",
    },
  ];

  const getWidthPercentage = (index: number) => {
    const baseWidth = 100;
    const reduction = index * 15;
    return Math.max(baseWidth - reduction, 40);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Funil de Vendas</h3>
      
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const width = getWidthPercentage(index);
          
          return (
            <div key={stage.name} className="relative">
              <div className="flex items-center gap-4">
                <div
                  className="relative transition-all duration-300"
                  style={{ width: `${width}%` }}
                >
                  <div
                    className={`${stage.color} text-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <p className="font-medium">{stage.name}</p>
                          <p className="text-sm opacity-90">
                            {stage.count} ({stage.percentage.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      {index < stages.length - 1 && (
                        <div className="text-xs opacity-75">
                          {stages[index + 1].count > 0 &&
                            `${((stages[index + 1].count / stage.count) * 100).toFixed(0)}% convertem`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {index < stages.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowDown className="h-5 w-5 text-muted-foreground animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {leads > 0 && (
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Taxa de Conversão Geral</p>
              <p className="text-2xl font-bold text-green-600">
                {((converted / leads) * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Taxa de Agendamento</p>
              <p className="text-2xl font-bold text-orange-600">
                {((scheduled / leads) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
