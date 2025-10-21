import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSecurityMonitor } from "@/hooks/useSecurityMonitor";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Shield, Activity, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export function SecurityDashboard() {
  const { metrics: securityMetrics, events } = useSecurityMonitor();
  const { getAllStats } = usePerformanceMonitor();
  const { getRecentLogs } = useAuditLog();

  const performanceStats = getAllStats();
  const auditLogs = getRecentLogs();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Métricas de Segurança */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eventos Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{securityMetrics.criticalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Falhas de Auth</CardTitle>
            <Shield className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{securityMetrics.failedAuthAttempts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Atividades Suspeitas</CardTitle>
            <Activity className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{securityMetrics.suspiciousActivities}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Detalhes */}
      <Tabs defaultValue="security" className="space-y-4">
        <TabsList>
          <TabsTrigger value="security">Eventos de Segurança</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="audit">Log de Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Recentes de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.slice(-10).reverse().map((event, idx) => (
                  <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <Badge variant={getSeverityColor(event.severity) as any}>
                      {event.severity}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium">{event.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(event.timestamp, 'dd/MM/yyyy HH:mm:ss')}
                      </p>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum evento de segurança registrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(performanceStats).map(([name, stats]) => (
                  <div key={name} className="pb-4 border-b last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{name}</span>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Média</p>
                        <p className="font-medium">{stats.avgDuration.toFixed(2)}ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">P95</p>
                        <p className="font-medium">{stats.p95.toFixed(2)}ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Max</p>
                        <p className="font-medium">{stats.maxDuration.toFixed(2)}ms</p>
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(performanceStats).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma métrica de performance registrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log de Auditoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.slice(-10).reverse().map((log: any, idx: number) => (
                  <div key={idx} className="pb-4 border-b last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {log.action.toUpperCase()} {log.resource}
                        </p>
                        {log.resource_id && (
                          <p className="text-sm text-muted-foreground">ID: {log.resource_id}</p>
                        )}
                      </div>
                      <Badge variant="outline">{log.action}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {log.metadata?.timestamp && format(new Date(log.metadata.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                    </p>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum log de auditoria registrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
