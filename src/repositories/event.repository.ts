import { supabase } from '../config/supabase';
import { Event, CreateEventDto, UpdateEventDto } from '../models/event.model';

export class EventRepository {
  private tableName = 'events';

  async findAll(): Promise<Event[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error finding events:', error);
      return [];
    }

    return data as Event[];
  }

  async findById(id: number): Promise<Event | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error finding event:', error);
      return null;
    }

    return data as Event;
  }

  async findUpcoming(): Promise<Event[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .gte('lastDay', today)
      .order('lastDay', { ascending: true });

    if (error) {
      console.error('Error finding upcoming events:', error);
      return [];
    }

    return data as Event[];
  }

  async create(eventData: CreateEventDto): Promise<Event | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      throw new Error('Erro ao criar evento');
    }

    return data as Event;
  }

  async update(id: number, eventData: UpdateEventDto): Promise<Event | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(eventData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      throw new Error('Erro ao atualizar evento');
    }

    return data as Event;
  }

  async delete(id: number): Promise<boolean> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      return false;
    }

    return true;
  }
}

export default new EventRepository();
