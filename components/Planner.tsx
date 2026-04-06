import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, StickyNote, Plus, Trash2, ChevronLeft, ChevronRight, Check, Image as ImageIcon, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Types
interface Note {
  id: string;
  title?: string;
  content: string;
  createdAt: string;
  color: string;
  image?: string;
}

interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description: string;
}

const COLORS = [
  'bg-yellow-100 border-yellow-200',
  'bg-blue-100 border-blue-200',
  'bg-green-100 border-green-200',
  'bg-pink-100 border-pink-200',
  'bg-purple-100 border-purple-200',
];

const Planner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'notes'>('calendar');
  
  // Notes State
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('ieee-scout-notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calendar State
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('ieee-scout-events');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');

  // Persistence
  useEffect(() => {
    localStorage.setItem('ieee-scout-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('ieee-scout-events', JSON.stringify(events));
  }, [events]);

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        alert("Image size must be less than 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNote = () => {
    if (!newNoteContent.trim() && !selectedImage && !newNoteTitle.trim()) return;
    const newNote: Note = {
      id: uuidv4(),
      title: newNoteTitle,
      content: newNoteContent,
      createdAt: new Date().toLocaleDateString(),
      color: selectedColor,
      image: selectedImage || undefined
    };
    setNotes([newNote, ...notes]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setSelectedImage(null);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleAddEvent = () => {
    if (!newEventTitle.trim()) return;
    const newEvent: Event = {
      id: uuidv4(),
      title: newEventTitle,
      date: selectedDate,
      description: newEventDesc
    };
    setEvents([...events, newEvent]);
    setNewEventTitle('');
    setNewEventDesc('');
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50 border border-gray-100"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = selectedDate === dateString;
      const isToday = new Date().toISOString().split('T')[0] === dateString;
      const dayEvents = events.filter(e => e.date === dateString);

      days.push(
        <div 
          key={day} 
          onClick={() => setSelectedDate(dateString)}
          className={`h-24 border border-gray-100 p-2 cursor-pointer transition-colors relative overflow-hidden group ${
            isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
          } ${isToday ? 'bg-blue-50/30' : ''}`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
              isToday ? 'bg-[#00629B] text-white' : 'text-gray-700'
            }`}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
            )}
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map(ev => (
              <div key={ev.id} className="text-[10px] truncate bg-blue-100 text-blue-800 px-1 rounded">
                {ev.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-[10px] text-gray-400 pl-1">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">My Planner</h2>
        <p className="text-gray-500 mt-2">Manage your deadlines, ideas, and schedule.</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm inline-flex">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'calendar' ? 'bg-blue-50 text-[#00629B]' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'notes' ? 'bg-blue-50 text-[#00629B]' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <StickyNote className="w-4 h-4 mr-2" />
            Notes
          </button>
        </div>
      </div>

      {activeTab === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex space-x-2">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-px mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 bg-gray-200 gap-px border border-gray-200 rounded-lg overflow-hidden">
              {renderCalendar()}
            </div>
          </div>

          {/* Event Sidebar */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col h-full">
            <h3 className="font-bold text-gray-900 mb-4">
              Events for {new Date(selectedDate).toLocaleDateString()}
            </h3>
            
            <div className="flex-1 overflow-y-auto mb-6 space-y-3 pr-2">
              {events.filter(e => e.date === selectedDate).length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-8">No events for this day.</p>
              ) : (
                events.filter(e => e.date === selectedDate).map(event => (
                  <div key={event.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100 group relative">
                    <h4 className="font-medium text-blue-900 text-sm">{event.title}</h4>
                    {event.description && <p className="text-xs text-blue-700 mt-1">{event.description}</p>}
                    <button 
                      onClick={() => handleDeleteEvent(event.id)}
                      className="absolute top-2 right-2 text-blue-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Add Event</h4>
              <input
                type="text"
                placeholder="Event Title"
                className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#00629B] focus:border-transparent outline-none"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
              />
              <textarea
                placeholder="Description (optional)"
                className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#00629B] focus:border-transparent outline-none resize-none h-20"
                value={newEventDesc}
                onChange={(e) => setNewEventDesc(e.target.value)}
              />
              <button
                onClick={handleAddEvent}
                disabled={!newEventTitle.trim()}
                className="w-full bg-[#00629B] text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Add Note Card */}
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col justify-center items-center text-center hover:border-[#00629B] transition-colors group h-80">
            <div className="w-full h-full flex flex-col">
              {selectedImage ? (
                <div className="relative w-full h-32 mb-2 rounded-lg overflow-hidden group/image flex-shrink-0">
                  <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : null}
              
              <input
                type="text"
                placeholder="Title (optional)"
                className="w-full mb-2 border-none focus:ring-0 text-gray-900 font-semibold placeholder:text-gray-400 text-base bg-transparent p-0"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
              />

              <textarea
                placeholder="Type your note here..."
                className="flex-1 w-full resize-none border-none focus:ring-0 text-gray-700 placeholder:text-gray-400 text-sm bg-transparent p-0"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              />
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <div className="flex space-x-1 items-center">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-5 h-5 rounded-full ${color.split(' ')[0]} border ${selectedColor === color ? 'ring-2 ring-offset-1 ring-gray-400' : 'border-transparent'}`}
                    />
                  ))}
                  <div className="w-px h-5 bg-gray-200 mx-2"></div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-400 hover:text-[#00629B] transition-colors"
                    title="Add Image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <button
                  onClick={handleAddNote}
                  disabled={!newNoteContent.trim() && !selectedImage && !newNoteTitle.trim()}
                  className="bg-[#00629B] text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Note Cards */}
          {notes.map(note => (
            <div key={note.id} className={`${note.color} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative group h-80 flex flex-col`}>
              <div className="flex-1 overflow-y-auto mb-2 pr-1 custom-scrollbar">
                {note.image && (
                  <div className="mb-3 rounded-lg overflow-hidden">
                    <img src={note.image} alt="Note attachment" className="w-full h-auto object-cover" />
                  </div>
                )}
                {note.title && (
                  <h4 className="font-bold text-gray-900 mb-2">{note.title}</h4>
                )}
                <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 mt-auto pt-3 border-t border-black/5">
                <span>{note.createdAt}</span>
                <button 
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-white/50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Planner;
