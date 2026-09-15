import { useEffect, useState } from 'react';
import { CalendarEvent } from '@/types/task';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { datetimeLocalFromIso, isoFromDatetimeLocal } from '@/lib/fuso';
import { useTranslation } from 'react-i18next';

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  defaultDate?: Date;
  onSave: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

function defaultStart(date: Date): string {
  const copy = new Date(date);
  copy.setMinutes(0, 0, 0);
  copy.setHours(copy.getHours() + 1);
  return datetimeLocalFromIso(copy.toISOString());
}

function plusHour(local: string): string {
  if (!local) return '';
  const iso = isoFromDatetimeLocal(local);
  return datetimeLocalFromIso(new Date(new Date(iso).getTime() + 60 * 60 * 1000).toISOString());
}

export function EventModal({ open, onOpenChange, event, defaultDate, onSave }: EventModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startsLocal, setStartsLocal] = useState('');
  const [endsLocal, setEndsLocal] = useState('');
  const [remindMinutes, setRemindMinutes] = useState('15');

  useEffect(() => {
    if (!open) return;
    if (event) {
      setTitle(event.title || '');
      setNotes(event.notes || '');
      setLocation(event.location || '');
      setAllDay(event.allDay);
      setStartsLocal(datetimeLocalFromIso(event.startsAt));
      setEndsLocal(datetimeLocalFromIso(event.endsAt));
      setRemindMinutes(String(event.remindMinutes ?? 15));
      return;
    }
    const start = defaultStart(defaultDate || new Date());
    setTitle('');
    setNotes('');
    setLocation('');
    setAllDay(false);
    setStartsLocal(start);
    setEndsLocal(plusHour(start));
    setRemindMinutes('15');
  }, [open, event, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startsLocal) return;
    const startsAt = allDay
      ? `${startsLocal.slice(0, 10)}T00:00:00-03:00`
      : isoFromDatetimeLocal(startsLocal);
    const endDay = (endsLocal || startsLocal).slice(0, 10);
    const endsAt = allDay
      ? `${endDay}T23:59:59-03:00`
      : endsLocal
        ? isoFromDatetimeLocal(endsLocal)
        : isoFromDatetimeLocal(plusHour(startsLocal));
    onSave({
      title: title.trim(),
      notes: notes.trim() || undefined,
      location: location.trim() || undefined,
      allDay,
      startsAt,
      endsAt,
      remindMinutes: Number(remindMinutes) || 15,
      meetingId: event?.meetingId ?? null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {event ? t('Edit Event') : t('New Event')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">{t('Title')}</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder={t('Event title')}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="all-day">{t('All day')}</Label>
            <Switch id="all-day" checked={allDay} onCheckedChange={setAllDay} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starts">{t('Starts')}</Label>
              <Input
                id="starts"
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? startsLocal.slice(0, 10) : startsLocal}
                onChange={(e) => {
                  const next = allDay ? `${e.target.value}T09:00` : e.target.value;
                  setStartsLocal(next);
                  if (!endsLocal || endsLocal <= next) setEndsLocal(plusHour(next));
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends">{t('Ends')}</Label>
              <Input
                id="ends"
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? endsLocal.slice(0, 10) : endsLocal}
                onChange={(e) => setEndsLocal(allDay ? `${e.target.value}T18:00` : e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">{t('Location or URL')}</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Meet, Zoom, endereço"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t('Notes')}</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>{t('Reminder')}</Label>
            <Select value={remindMinutes} onValueChange={setRemindMinutes}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t('At start')}</SelectItem>
                <SelectItem value="5">5 min</SelectItem>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">1 h</SelectItem>
                <SelectItem value="1440">{t('1 day before')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('Cancel')}
            </Button>
            <Button type="submit">{event ? t('Save Changes') : t('Create Event')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
