import React, { useState } from 'react';
import { Calendar, FileText, FileSpreadsheet, File, Download, ChevronDown } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useGenerateReport, ReportParams } from '@/hooks/useReports';

type ReportType = 'productivity' | 'batches' | 'operators';
type ReportFormat = 'excel' | 'pdf';
type PeriodType = 'custom' | 'month' | 'quarter' | 'year';

interface DateRange {
  from: Date;
  to: Date;
}

const ReportDownload = () => {
  const [reportType, setReportType] = useState<ReportType>('productivity');
  const [reportFormat, setReportFormat] = useState<ReportFormat>('excel');
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  
  const { mutateAsync: generateReport, isPending } = useGenerateReport();

  const handlePeriodChange = (value: PeriodType) => {
    setPeriodType(value);
    const today = new Date();
    
    switch(value) {
      case 'month':
        setDateRange({
          from: startOfMonth(today),
          to: endOfMonth(today),
        });
        break;
      case 'quarter':
        setDateRange({
          from: startOfMonth(subMonths(today, 2)),
          to: endOfMonth(today),
        });
        break;
      case 'year':
        setDateRange({
          from: startOfMonth(subMonths(today, 11)),
          to: endOfMonth(today),
        });
        break;
      // 'custom' ne fait rien car l'utilisateur sélectionne les dates manuellement
    }
  };

  const handleDownload = async () => {
    try {
      const reportParams: ReportParams = {
        type: reportType,
        format: reportFormat,
        dateFrom: dateRange.from,
        dateTo: dateRange.to
      };
      
      // Notification du début du téléchargement
      toast({
        title: "Génération du rapport en cours",
        description: "Veuillez patienter pendant que nous préparons votre rapport...",
      });
      
      // Appel à la fonction de génération du rapport
      await generateReport(reportParams);
      
    } catch (error) {
      console.error("Erreur lors de la génération du rapport:", error);
    }
  };

  const formatDisplayText = () => {
    const reportTypeText = 
      reportType === 'productivity' ? 'Productivité' : 
      reportType === 'batches' ? 'Lots' : 'Opérateurs';
      
    return `${reportTypeText} (${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')})`;
  };

  return (
    <div className="bg-pharma-blue-light rounded-lg p-4">
      <h2 className="text-white text-lg font-medium mb-4">Télécharger un rapport</h2>
      
      <div className="space-y-4">
        {/* Type de rapport */}
        <div>
          <label className="text-pharma-text-light text-sm mb-1 block">Type de rapport</label>
          <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
            <SelectTrigger className="bg-pharma-blue-dark border-pharma-blue-dark text-white w-full">
              <SelectValue placeholder="Sélectionnez un type de rapport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="productivity">Rapport de productivité</SelectItem>
              <SelectItem value="batches">Rapport des lots</SelectItem>
              <SelectItem value="operators">Rapport des opérateurs</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Période */}
        <div>
          <label className="text-pharma-text-light text-sm mb-1 block">Période</label>
          <div className="flex gap-2">
            <Select value={periodType} onValueChange={(value) => handlePeriodChange(value as PeriodType)}>
              <SelectTrigger className="bg-pharma-blue-dark border-pharma-blue-dark text-white flex-1">
                <SelectValue placeholder="Sélectionnez une période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">Dernier trimestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
                <SelectItem value="custom">Personnalisé</SelectItem>
              </SelectContent>
            </Select>
            
            {periodType === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-pharma-blue-dark border-pharma-blue-dark text-white">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange.from && dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      <span>Sélectionnez des dates</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange(range as DateRange);
                      }
                    }}
                    numberOfMonths={2}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
        
        {/* Format de fichier */}
        <div>
          <label className="text-pharma-text-light text-sm mb-1 block">Format de fichier</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-pharma-blue-dark border-pharma-blue-dark text-white w-full justify-between">
                <div className="flex items-center">
                  {reportFormat === 'excel' ? (
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                  ) : (
                    <File className="mr-2 h-4 w-4" />
                  )}
                  {reportFormat === 'excel' ? 'Excel (.xlsx)' : 'PDF (.pdf)'}
                </div>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setReportFormat('excel')} className="cursor-pointer">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setReportFormat('pdf')} className="cursor-pointer">
                <File className="mr-2 h-4 w-4" />
                PDF (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Aperçu */}
        <div className="bg-pharma-blue-dark/40 p-3 rounded text-pharma-text-light text-sm">
          <div className="flex items-center mb-1">
            <FileText className="mr-2 h-4 w-4" />
            <span className="font-medium">Aperçu du rapport</span>
          </div>
          <p>{formatDisplayText()}</p>
        </div>
        
        {/* Bouton de téléchargement */}
        <Button 
          onClick={handleDownload} 
          className="w-full bg-pharma-accent-blue hover:bg-pharma-accent-blue/80"
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Génération en cours...
            </span>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" /> Télécharger le rapport
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReportDownload;
