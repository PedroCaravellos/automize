import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportExportProps {
  data: any;
  negocioName?: string;
}

export const ReportExport = ({ data, negocioName }: ReportExportProps) => {
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const exportToCSV = async () => {
    setExporting(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      const headers = Object.keys(data[0] || {}).join(",");
      const rows = data.map((row: any) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(",")
      );
      const csv = [headers, ...rows].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `relatorio_${negocioName || "geral"}_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        setExporting(false);
        setProgress(0);
      }, 500);

      toast({
        title: "Relatório exportado!",
        description: "O arquivo CSV foi baixado com sucesso.",
      });
    } catch (error) {
      clearInterval(interval);
      setExporting(false);
      setProgress(0);
      
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
    }
  };

  const exportToJSON = async () => {
    setExporting(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `relatorio_${negocioName || "geral"}_${new Date().toISOString().split("T")[0]}.json`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        setExporting(false);
        setProgress(0);
      }, 500);

      toast({
        title: "Relatório exportado!",
        description: "O arquivo JSON foi baixado com sucesso.",
      });
    } catch (error) {
      clearInterval(interval);
      setExporting(false);
      setProgress(0);

      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (!data || data.length === 0) {
      toast({
        title: "Sem dados",
        description: "Não há dados disponíveis para exportar.",
        variant: "destructive",
      });
      return;
    }

    if (format === "csv") {
      exportToCSV();
    } else {
      exportToJSON();
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Relatório
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Baixe os dados analíticos em diferentes formatos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={format} onValueChange={(val: any) => setFormat(val)} disabled={exporting}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (Excel)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExport} disabled={!data || data.length === 0 || exporting}>
              <Download className="mr-2 h-4 w-4" />
              {exporting ? "Exportando..." : "Exportar"}
            </Button>
          </div>
        </div>

        {exporting && (
          <div className="flex items-center gap-3">
            <Progress value={progress} className="flex-1" />
            <span className="text-sm text-muted-foreground min-w-[3rem] text-right">{progress}%</span>
          </div>
        )}
      </div>
    </Card>
  );
};
