import { supabase } from '../config/supabase';
import { Profile, CreateProfileDto, UpdateProfileDto } from '../models/profile.model';

export class ProfileRepository {
  private tableName = 'profiles';

  async findById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error finding profile:', error);
      return null;
    }

    return data as Profile;
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('userId', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error finding profile by userId:', error);
      return null;
    }

    return data as Profile;
  }

  async findByUsername(username: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.error('Error finding profile by username:', error);
      return null;
    }

    return data as Profile;
  }

  async create(profileData: CreateProfileDto): Promise<Profile | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw new Error('Erro ao criar perfil');
    }

    return data as Profile;
  }

  async update(id: string, profileData: UpdateProfileDto): Promise<Profile | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error('Erro ao atualizar perfil');
    }

    return data as Profile;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      console.error('Error deleting profile:', error);
      return false;
    }

    return true;
  }
}

export default new ProfileRepository();
