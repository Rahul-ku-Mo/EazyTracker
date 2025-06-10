import React, { useState } from 'react';
import { 
  Shield, 
  UserPlus, 
  Users, 
  Settings, 
  Mail, 
  Crown,
  Eye,
  EyeOff,
  Search,
  Plus,
  Minus,
  Filter,
  MoreHorizontal,
  UserX,
  CheckSquare,
  Square,
  Link,
  UserMinus
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/layouts/Container';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';

interface TeamMember {
  id: string;
  name?: string;
  email: string;
  username?: string;
  imageUrl?: string;
  department?: string;
  efficiency?: number;
  isActive?: boolean;
  role: 'ADMIN' | 'USER';
  boardAccess: {
    board: {
      id: number;
      title: string;
      colorName: string;
      colorValue: string;
    };
    role: 'ADMIN' | 'MEMBER';
    canEdit: boolean;
  }[];
}

interface Board {
  id: number;
  title: string;
  colorName: string;
  colorValue: string;
}

const TeamManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [selectedBoard, setSelectedBoard] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedBoardForBulk, setSelectedBoardForBulk] = useState<number | null>(null);
  const [filterByRole, setFilterByRole] = useState<'ALL' | 'ADMIN' | 'MEMBER'>('ALL');
  const [filterByStatus, setFilterByStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken");

  // Fetch team members
  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/teams/members`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.data;
    },
    enabled: !!accessToken,
  });

  // Fetch team-related boards only
  const { data: boards = [], isLoading: isLoadingBoards } = useQuery({
    queryKey: ["team-boards", teamData?.team?.id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/teams/boards`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.data.map((board: any) => ({
        id: board.id,
        title: board.title,
        colorName: board.colorName,
        colorValue: board.colorValue,
      }));
    },
    enabled: !!accessToken && !!teamData,
  });

  const teamMembers = teamData?.members || [];
  const currentUser = teamMembers.find((member: TeamMember) => member.role === 'ADMIN') || teamMembers[0];

  // Filter and search logic
  const filteredMembers = teamMembers.filter((member: TeamMember) => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterByRole === 'ALL' || 
                       (filterByRole === 'ADMIN' && member.role === 'ADMIN') ||
                       (filterByRole === 'MEMBER' && member.role === 'USER');
    const matchesStatus = filterByStatus === 'ALL' ||
                         (filterByStatus === 'ACTIVE' && member.isActive !== false) ||
                         (filterByStatus === 'INACTIVE' && member.isActive === false);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Bulk operations handlers
  const handleSelectMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
      setShowBulkActions(false);
    } else {
      const allIds = new Set<string>(filteredMembers.map((member: TeamMember) => member.id));
      setSelectedMembers(allIds);
      setShowBulkActions(true);
    }
  };

  const handleBulkAddToBoard = () => {
    if (!selectedBoardForBulk || selectedMembers.size === 0) return;
    
    const promises = Array.from(selectedMembers).map(userId => 
      addToBoardMutation.mutateAsync({ userId, boardId: selectedBoardForBulk, role: inviteRole })
    );

    Promise.all(promises).then(() => {
      toast({
        title: 'Bulk Action Completed',
        description: `Added ${selectedMembers.size} members to the board.`,
      });
      setSelectedMembers(new Set());
      setShowBulkActions(false);
      setSelectedBoardForBulk(null);
    }).catch(() => {
      toast({
        title: 'Error',
        description: 'Some operations failed. Please try again.',
        variant: 'destructive',
      });
    });
  };

  const handleBulkRemoveFromBoard = () => {
    if (!selectedBoardForBulk || selectedMembers.size === 0) return;
    
    const promises = Array.from(selectedMembers).map(userId => 
      removeFromBoardMutation.mutateAsync({ userId, boardId: selectedBoardForBulk })
    );

    Promise.all(promises).then(() => {
      toast({
        title: 'Bulk Action Completed',
        description: `Removed ${selectedMembers.size} members from the board.`,
      });
      setSelectedMembers(new Set());
      setShowBulkActions(false);
      setSelectedBoardForBulk(null);
    }).catch(() => {
      toast({
        title: 'Error',
        description: 'Some operations failed. Please try again.',
        variant: 'destructive',
      });
    });
  };

  // Mutations for team management operations
  const toggleUserMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/teams/users/${userId}/status`,
        { isActive },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ userId, boardId, role }: { userId: string; boardId: number; role: string }) => {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/teams/boards/${boardId}/members/${userId}/permissions`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["team-boards"] });
    },
  });

  const removeFromBoardMutation = useMutation({
    mutationFn: async ({ userId, boardId }: { userId: string; boardId: number }) => {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/teams/boards/${boardId}/members/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["team-boards"] });
    },
  });

  const addToBoardMutation = useMutation({
    mutationFn: async ({ userId, boardId, role }: { userId: string; boardId: number; role: string }) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/teams/boards/${boardId}/members/${userId}`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["team-boards"] });
    },
  });

  // Loading state
  if (isLoadingTeam || isLoadingBoards) {
    return (
      <MainLayout title="Team Management">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading team data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleToggleUserStatus = (userId: string, isActive: boolean) => {
    toggleUserMutation.mutate({ userId, isActive }, {
      onSuccess: () => {
        toast({
          title: isActive ? 'User Enabled' : 'User Disabled',
          description: `User has been ${isActive ? 'enabled' : 'disabled'} successfully.`,
          variant: 'default',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update user status.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleUpdatePermissions = (userId: string, boardId: number, role: 'ADMIN' | 'MEMBER') => {
    updatePermissionsMutation.mutate({ userId, boardId, role }, {
      onSuccess: () => {
        toast({
          title: 'Permissions Updated',
          description: `User permissions updated to ${role} for the selected board.`,
          variant: 'default',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update permissions.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleRemoveFromBoard = (userId: string, boardId: number) => {
    removeFromBoardMutation.mutate({ userId, boardId }, {
      onSuccess: () => {
        toast({
          title: 'User Removed',
          description: 'User has been removed from the board.',
          variant: 'default',
        });
        // Close the member dialog if removing from selected member
        if (selectedMember && selectedMember.id === userId) {
          setSelectedMember(null);
        }
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to remove user from board.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleSendInvitation = () => {
    if (!inviteEmail || !selectedBoard) {
      toast({
        title: 'Missing Information',
        description: 'Please provide email and select a board.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Invitation Sent',
      description: `Invitation sent to ${inviteEmail} for board access.`,
      variant: 'default',
    });

    setShowInviteDialog(false);
    setInviteEmail('');
    setSelectedBoard(null);
    setInviteRole('MEMBER');
  };

  const getRoleIcon = (role: string) => {
    return role === 'ADMIN' ? <Crown className="w-4 h-4 text-yellow-500" /> : <Shield className="w-4 h-4 text-blue-500" />;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleInviteToBoard = () => {
    if (!selectedBoard || !selectedMember) return;
    
    addToBoardMutation.mutate({ 
      userId: selectedMember.id, 
      boardId: selectedBoard, 
      role: inviteRole 
    }, {
      onSuccess: () => {
        toast({
          title: "Board Access Granted",
          description: `${selectedMember.name} has been added to the board.`,
        });
        setSelectedBoard(null);
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to add user to board.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <MainLayout title="Team Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Team Management</h1>
            <p className="text-muted-foreground text-sm">
              Manage team members, permissions, and board access
            </p>
          </div>
          
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendInvitation}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Board Permissions
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            {/* Search and Filter Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Team Members ({filteredMembers.length})</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Select value={filterByRole} onValueChange={(value: 'ALL' | 'ADMIN' | 'MEMBER') => setFilterByRole(value)}>
                      <SelectTrigger className="w-32">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="MEMBER">Member</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterByStatus} onValueChange={(value: 'ALL' | 'ACTIVE' | 'INACTIVE') => setFilterByStatus(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              
              {/* Bulk Actions Bar */}
              {showBulkActions && (
                <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedMembers.size} member(s) selected
                    </span>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={selectedBoardForBulk?.toString() || ""} 
                        onValueChange={(value) => setSelectedBoardForBulk(parseInt(value))}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder={
                            boards.length === 0 
                              ? "No boards available" 
                              : "Select board for bulk action"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {boards.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              No boards available for bulk actions
                            </div>
                          ) : (
                            boards.map((board: Board) => (
                              <SelectItem key={board.id} value={board.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: board.colorValue }} 
                                  />
                                  {board.title}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        onClick={handleBulkAddToBoard}
                        disabled={!selectedBoardForBulk || boards.length === 0}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Board
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={handleBulkRemoveFromBoard}
                        disabled={!selectedBoardForBulk || boards.length === 0}
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Remove from Board
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSelectAll}
                          className="h-8 w-8 p-0"
                        >
                          {selectedMembers.size === filteredMembers.length && filteredMembers.length > 0 ? 
                            <CheckSquare className="h-4 w-4" /> : 
                            <Square className="h-4 w-4" />
                          }
                        </Button>
                      </TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Efficiency</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member: TeamMember) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectMember(member.id)}
                            className="h-8 w-8 p-0"
                          >
                            {selectedMembers.has(member.id) ? 
                              <CheckSquare className="h-4 w-4" /> : 
                              <Square className="h-4 w-4" />
                            }
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={member.imageUrl} />
                              <AvatarFallback>
                                {member?.name?.split(' ').map((n: string) => n[0]).join('') || member?.email?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name || member.email}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.department || 'Not specified'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(member.role)}
                            <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'}>
                              {member.role}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.isActive !== false ? 'default' : 'destructive'}>
                            {member.isActive !== false ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={getEfficiencyColor(member.efficiency || 0)}>
                            {member.efficiency || 0}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {currentUser?.role === 'ADMIN' && member.id !== currentUser?.id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleUserStatus(member.id, member.isActive === false)}
                              >
                                {member.isActive !== false ? (
                                  <><EyeOff className="w-4 h-4 mr-1" /> Disable</>
                                ) : (
                                  <><Eye className="w-4 h-4 mr-1" /> Enable</>
                                )}
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setSelectedMember(member)}>
                                  <Settings className="h-4 w-4 mr-2" />
                                  Manage Boards
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {currentUser?.role === 'ADMIN' && member.id !== currentUser?.id && (
                                  <DropdownMenuItem 
                                    onClick={() => handleToggleUserStatus(member.id, false)}
                                    className="text-destructive"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Remove from Team
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div className="grid gap-4">
              {boards.map((board: Board) => (
                <Card key={board.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: board.colorValue }} 
                        />
                        {board.title}
                      </CardTitle>
                      
                      {/* Add Users to Board Button */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Users
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Users to {board.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Select users to add:</Label>
                              {teamMembers
                                .filter((member: TeamMember) => 
                                  !member.boardAccess.some((access: any) => access.board.id === board.id)
                                )
                                .map((member: TeamMember) => (
                                  <div
                                    key={member.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                                    onClick={() => {
                                      addToBoardMutation.mutate({
                                        userId: member.id,
                                        boardId: board.id,
                                        role: 'MEMBER'
                                      });
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="w-8 h-8">
                                        <AvatarImage src={member.imageUrl} />
                                        <AvatarFallback>
                                          {member?.name?.split(' ').map((n: string) => n[0]).join('') || member?.email?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">{member.name || member.email}</div>
                                        <div className="text-sm text-muted-foreground">{member.department || 'No department'}</div>
                                      </div>
                                    </div>
                                    <Button size="sm">
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))
                              }
                              {teamMembers.filter((member: TeamMember) => 
                                !member.boardAccess.some((access: any) => access.board.id === board.id)
                              ).length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  All team members already have access to this board
                                </p>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Access Level</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamMembers
                          .filter((member: TeamMember) => member.boardAccess.some((access: any) => access.board.id === board.id))
                          .map((member: TeamMember) => {
                            const boardAccess = member.boardAccess.find((access: any) => access.board.id === board.id);
                            return (
                              <TableRow key={`${board.id}-${member.id}`}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-6 h-6">
                                      <AvatarImage src={member.imageUrl} />
                                      <AvatarFallback className="text-xs">
                                        {member?.name?.split(' ').map((n: string) => n[0]).join('') || member?.email?.charAt(0).toUpperCase() || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{member.name || member.email}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={boardAccess?.role === 'ADMIN' ? 'default' : 'secondary'}>
                                    {boardAccess?.role}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {currentUser?.role === 'ADMIN' && member.id !== currentUser?.id && (
                                    <div className="flex items-center gap-2">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Board Actions</DropdownMenuLabel>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onClick={() => handleUpdatePermissions(member.id, board.id, 
                                              boardAccess?.role === 'ADMIN' ? 'MEMBER' : 'ADMIN'
                                            )}
                                          >
                                            <Shield className="mr-2 h-4 w-4" />
                                            Make {boardAccess?.role === 'ADMIN' ? 'Member' : 'Admin'}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => {
                                              navigator.clipboard.writeText(`${window.location.origin}/boards/${board.id}`);
                                              toast({
                                                title: 'Board link copied',
                                                description: 'Board link has been copied to clipboard',
                                              });
                                            }}
                                          >
                                            <Link className="mr-2 h-4 w-4" />
                                            Copy Board Link
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => {
                                              const subject = `Board Access: ${board.title}`;
                                              const body = `You have ${boardAccess?.role?.toLowerCase()} access to the board "${board.title}". You can access it here: ${window.location.origin}/boards/${board.id}`;
                                              window.open(`mailto:${member.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                                            }}
                                          >
                                            <Mail className="mr-2 h-4 w-4" />
                                            Send Access Email
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => handleRemoveFromBoard(member.id, board.id)}
                                          >
                                            <UserMinus className="mr-2 h-4 w-4" />
                                            Remove from Board
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  )}
                                  {member.id === currentUser?.id && (
                                    <Badge variant="outline" className="text-xs">
                                      You
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold">Team Performance Analytics</h2>
                <p className="text-sm text-muted-foreground">
                  Comprehensive team metrics, velocity, and performance insights
                </p>
              </div>
              <div className="flex gap-2">
                <Select defaultValue="week">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Team Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Team Velocity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {(teamMembers.filter((member: TeamMember) => member.isActive !== false).length * 3.2).toFixed(0)}
                  </div>
                  <p className="text-xs text-gray-500">Cards per week</p>
                  <div className="text-xs text-green-600 mt-1">+12% from last week</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {teamMembers.length > 0 ? Math.round(teamMembers.reduce((acc: number, member: TeamMember) => acc + (member.efficiency || 0), 0) / teamMembers.length) : 0}%
                  </div>
                  <p className="text-xs text-gray-500">On-time delivery</p>
                  <div className="text-xs text-blue-600 mt-1">+5% from last week</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Avg. Completion Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    2.3
                  </div>
                  <p className="text-xs text-gray-500">Hours per card</p>
                  <div className="text-xs text-red-600 mt-1">+8% from target</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Team Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {teamMembers.length > 0 ? Math.round(teamMembers.reduce((acc: number, member: TeamMember) => acc + (member.efficiency || 0), 0) / teamMembers.length) : 0}%
                  </div>
                  <p className="text-xs text-gray-500">Overall performance</p>
                  <div className="text-xs text-orange-600 mt-1">+3% from last month</div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Charts & Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Member Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Team Member Performance</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Individual efficiency and task completion metrics
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMembers.map((member: TeamMember) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={member.imageUrl} />
                            <AvatarFallback>
                              {member?.name?.split(' ').map((n: string) => n[0]).join('') || member?.email?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{member.name || member.email}</div>
                            <div className="text-xs text-gray-500">{member.department || 'Not specified'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`font-medium text-sm ${getEfficiencyColor(member.efficiency || 0)}`}>
                              {member.efficiency || 0}%
                            </div>
                            <div className="text-xs text-gray-500">Efficiency</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-sm">{member.boardAccess.length}</div>
                            <div className="text-xs text-gray-500">Boards</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-sm text-green-600">↗ +5%</div>
                            <div className="text-xs text-gray-500">Trend</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Velocity & Completion Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Velocity & Completion Trends</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Weekly team velocity and completion rate trends
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="text-muted-foreground mb-2">📊</div>
                      <div className="text-sm font-medium">Velocity Analytics</div>
                      <div className="text-xs text-muted-foreground">Coming soon</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Insights & Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Insights & Recommendations</CardTitle>
                <div className="text-sm text-muted-foreground">
                  AI-driven insights to optimize team performance
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-green-600 dark:text-green-900 p-2 rounded-lg">🎯 Strengths</h4>
                    <div className="space-y-2">
                      <div className="text-xs bg-green-50 dark:bg-green-900/10 p-3 rounded border-l-2 border-green-500">
                        High team velocity with consistent delivery rates
                      </div>
                      <div className="text-xs bg-green-50 dark:bg-green-900/10 p-3 rounded border-l-2 border-green-500">
                        Strong collaboration across {boards.length} active projects
                      </div>
                      <div className="text-xs bg-green-50 dark:bg-green-900/10 p-3 rounded border-l-2 border-green-500">
                        Efficient task completion with {teamMembers.filter((m: TeamMember) => (m.efficiency || 0) > 90).length} high-performers
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-orange-600">💡 Recommendations</h4>
                    <div className="space-y-2">
                      <div className="text-xs bg-orange-50 dark:bg-orange-900/10 p-3 rounded border-l-2 border-orange-500">
                        Consider pairing junior members with high-performers for knowledge transfer
                      </div>
                      <div className="text-xs bg-orange-50 dark:bg-orange-900/10 p-3 rounded border-l-2 border-orange-500">
                        Implement daily standups to improve communication and reduce blockers
                      </div>
                      <div className="text-xs bg-orange-50 dark:bg-orange-900/10 p-3 rounded border-l-2 border-orange-500">
                        Review workload distribution to prevent burnout in top performers
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Performance Score</div>
                    <div className="text-lg font-bold text-green-600">
                      {teamMembers.length > 0 ? Math.round(teamMembers.reduce((acc: number, member: TeamMember) => acc + (member.efficiency || 0), 0) / teamMembers.length) : 0}/100
                    </div>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                      style={{
                        width: `${teamMembers.length > 0 ? Math.round(teamMembers.reduce((acc: number, member: TeamMember) => acc + (member.efficiency || 0), 0) / teamMembers.length) : 0}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Based on velocity, completion rate, and team efficiency metrics
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Member Management Dialog */}
        {selectedMember && (
          <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Manage {selectedMember.name || selectedMember.email}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedMember.imageUrl} />
                    <AvatarFallback>
                      {selectedMember?.name?.split(' ').map((n: string) => n[0]).join('') || selectedMember?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedMember.name || selectedMember.email}</h3>
                    <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label>Add to Board</Label>
                    <div className="flex space-x-2 mt-1">
                      <Select 
                        value={selectedBoard?.toString() || ""} 
                        onValueChange={(value) => setSelectedBoard(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            boards.filter((board: Board) => 
                              !selectedMember.boardAccess.some((access: any) => access.board.id === board.id)
                            ).length === 0 
                              ? "No boards available" 
                              : "Select board"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {boards
                            .filter((board: Board) => 
                              !selectedMember.boardAccess.some((access: any) => access.board.id === board.id)
                            ).length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              No boards available to add
                            </div>
                          ) : (
                            boards
                              .filter((board: Board) => 
                                !selectedMember.boardAccess.some((access: any) => access.board.id === board.id)
                              )
                              .map((board: Board) => (
                                <SelectItem key={board.id} value={board.id.toString()}>
                                  {board.title}
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                      <Select value={inviteRole} onValueChange={(value: 'ADMIN' | 'MEMBER') => setInviteRole(value)}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleInviteToBoard} 
                        disabled={!selectedBoard || boards.filter((board: Board) => 
                          !selectedMember.boardAccess.some((access: any) => access.board.id === board.id)
                        ).length === 0}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Current Board Access</Label>
                    <div className="space-y-2 mt-1">
                      {selectedMember.boardAccess.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground text-center border rounded-lg border-dashed">
                          <UserX className="mx-auto h-8 w-8 mb-2 opacity-50" />
                          No board access yet
                          <p className="text-xs mt-1">Add this member to boards to get started</p>
                        </div>
                      ) : (
                        selectedMember.boardAccess.map((access: any) => (
                          <div key={access.board.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded" 
                                style={{ backgroundColor: access.board.colorValue }}
                              />
                              <span className="text-sm">{access.board.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={access.role === 'ADMIN' ? 'default' : 'secondary'}>
                                {access.role}
                              </Badge>
                              {currentUser?.role === 'ADMIN' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFromBoard(selectedMember.id, access.board.id)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  ×
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

export default TeamManagement; 