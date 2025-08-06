import { useState, useMemo } from 'react';
import { 
  Users, 
  Calendar,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ToolData } from '@/data/dashboardData';

interface ToolsTableProps {
  data: ToolData[];
}

type SortField = 'name' | 'monthlyCost' | 'accounts' | 'assignedPerson' | 'renewalDate';
type SortDirection = 'asc' | 'desc';

export function ToolsTable({ data }: ToolsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [personFilter, setPersonFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('monthlyCost');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { formatCurrency, convertAmount } = useCurrency();

  // Get unique persons for filter - PRD Required
  const uniquePersons = useMemo(() => {
    const persons = new Set(data.map(tool => tool.assignedPerson));
    return Array.from(persons).sort();
  }, [data]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.assignedPerson.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPerson = personFilter === 'all' || tool.assignedPerson === personFilter;
      return matchesSearch && matchesPerson;
    });

    return filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle null values for renewalDate
      if (sortField === 'renewalDate') {
        if (!aValue && !bValue) return 0;
        if (!aValue) return sortDirection === 'asc' ? 1 : -1;
        if (!bValue) return sortDirection === 'asc' ? -1 : 1;
      }

      if (sortField === 'assignedPerson' || sortField === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, searchTerm, personFilter, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detailed Tool Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No tool data available. Please upload your data to see the detailed analysis.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Tool Analysis</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* PRD Required: Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools or people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* PRD Required: Person filter dropdown */}
          <Select value={personFilter} onValueChange={setPersonFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by person" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All People</SelectItem>
              {uniquePersons.map(person => (
                <SelectItem key={person} value={person}>{person}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {/* PRD Required Columns */}
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Tool Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('accounts')}
                >
                  <div className="flex items-center gap-2">
                    Accounts
                    {getSortIcon('accounts')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('monthlyCost')}
                >
                  <div className="flex items-center gap-2">
                    Monthly Cost
                    {getSortIcon('monthlyCost')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('assignedPerson')}
                >
                  <div className="flex items-center gap-2">
                    Person
                    {getSortIcon('assignedPerson')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('renewalDate')}
                >
                  <div className="flex items-center gap-2">
                    Renewal Date
                    {getSortIcon('renewalDate')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No tools match your current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedData.map((tool) => (
                  <TableRow key={tool.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {tool.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {tool.accounts}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {formatCurrency(convertAmount(tool.monthlyCost))}
                      </span>
                    </TableCell>
                    <TableCell>
                      {tool.assignedPerson}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(tool.renewalDate)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {filteredAndSortedData.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredAndSortedData.length} of {data.length} tools
          </div>
        )}
      </CardContent>
    </Card>
  );
}