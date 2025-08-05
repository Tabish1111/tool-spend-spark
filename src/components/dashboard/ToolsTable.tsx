import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  SortAsc, 
  SortDesc, 
  AlertTriangle,
  Users,
  Calendar
} from "lucide-react";
import { ToolData } from "@/data/dashboardData";
import { cn } from "@/lib/utils";

interface ToolsTableProps {
  data: ToolData[];
}

type SortField = 'name' | 'monthlyCost' | 'gunaHonestyMeter' | 'accounts' | 'renewalDate';
type SortDirection = 'asc' | 'desc';

export function ToolsTable({ data }: ToolsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [personFilter, setPersonFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('monthlyCost');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedData = data
    .filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPerson = personFilter === "all" || tool.assignedPerson === personFilter;
      const matchesCategory = categoryFilter === "all" || tool.category === categoryFilter;
      return matchesSearch && matchesPerson && matchesCategory;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * modifier;
      }
      return ((aVal as number) - (bVal as number)) * modifier;
    });

  const GunaGauge = ({ value }: { value: number }) => (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full",
              i < value 
                ? value >= 8 ? "bg-success" 
                  : value >= 6 ? "bg-warning" 
                  : "bg-destructive"
                : "bg-muted"
            )}
          />
        ))}
      </div>
      <span className="text-sm font-medium">{value || 'null'}/10</span>
    </div>
  );

  const formatCellValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return 'null';
    }
    return value;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={personFilter} onValueChange={setPersonFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Person" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All People</SelectItem>
                <SelectItem value="Rudyculous">Rudyculous</SelectItem>
                <SelectItem value="Rudraksh">Rudraksh</SelectItem>
                <SelectItem value="Both">Both</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Need">Need</SelectItem>
                <SelectItem value="Want">Want</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSort('name')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Tool Name
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSort('accounts')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Accounts
                    {sortField === 'accounts' && (
                      sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSort('monthlyCost')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Monthly Cost
                    {sortField === 'monthlyCost' && (
                      sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Person</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSort('gunaHonestyMeter')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Guna Meter
                    {sortField === 'gunaHonestyMeter' && (
                      sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSort('renewalDate')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Renewal Date
                    {sortField === 'renewalDate' && (
                      sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((tool) => (
                <TableRow key={tool.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {tool.isOverBudget && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                      {tool.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {formatCellValue(tool.accounts)}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {tool.monthlyCost ? `$${tool.monthlyCost.toFixed(2)}` : 'null'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      tool.assignedPerson === 'Both' ? 'secondary' : 'outline'
                    }>
                      {formatCellValue(tool.assignedPerson)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tool.category === 'Need' ? 'default' : 'secondary'}>
                      {formatCellValue(tool.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <GunaGauge value={tool.gunaHonestyMeter} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {tool.renewalDate ? new Date(tool.renewalDate).toLocaleDateString() : 'null'}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}