type DateRange = {
  startDate: Date;
  endDate: Date;
};

interface ExportOptions {
  dateRange: DateRange;
  includeAnalysis: boolean;
  format: 'CSV' | 'PDF';
}
