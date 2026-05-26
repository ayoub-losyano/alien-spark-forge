// Team member service - centralized business logic for team
import { supabase } from '@/integrations/supabase/client';
import type { TeamMember, TeamMemberInsert, TeamMemberUpdate } from '@/types';
import { logActivity } from "./activity.service";

export const teamService = {
  async getAll(): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<TeamMember | null> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getCount(): Promise<number> {
    const { count, error } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count ?? 0;
  },

  async create(member: TeamMemberInsert): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .insert(member)
      .select()
      .single();
    
    if (error) throw error;
    
    await logActivity('member_added', `Team member ${member.name} added`, 'team_member', data.id);
    return data;
  },

  async update(id: string, updates: Partial<TeamMemberUpdate>): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateWithLog(id: string, updates: Partial<TeamMemberUpdate>, memberName: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    await logActivity('member_updated', `Team member ${memberName} updated`, 'team_member', id);
  },

  async delete(id: string, memberName: string): Promise<void> {
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    
    if (error) throw error;
    await logActivity('member_deleted', `Team member ${memberName} deleted`, 'team_member', id);
  },

  async updatePresence(email: string): Promise<void> {
    await supabase
      .from('team_members')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('email', email);
  },

  async getMemberOrders(memberId: string, memberName: string): Promise<any[]> {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .or(`assigned_to.eq.${memberName},assigned_employee_id.eq.${memberId}`)
      .order('created_at', { ascending: false });
    
    return data ?? [];
  },
};
