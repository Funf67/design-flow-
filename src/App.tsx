import React, { useState } from 'react';
import { AppProvider, useAppContext } from './store';
import { Timeline } from './components/Timeline/Timeline';
import { Calendar, Plus, Search, Settings, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, subDays } from 'date-fns';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { TaskModal } from './components/TaskModal/TaskModal';

function MainContent() {
  const { viewMode, setViewMode, t, language, setLanguage, searchQuery, setSearchQuery, startDate, setStartDate } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const handlePrev = () => {
    const shift = viewMode === '14-days' ? 7 : 30;
    setStartDate(subDays(startDate, shift));
  };

  const handleNext = () => {
    const shift = viewMode === '14-days' ? 7 : 30;
    setStartDate(addDays(startDate, shift));
  };

  const handleToday = () => {
    setStartDate(subDays(new Date(), 7));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-inner">
            D
          </div>
          <h1 className="text-xl font-semibold tracking-tight">DesignFlow</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder={t('searchTasks')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-blue-500 h-9"
            />
          </div>
          
          <Button size="sm" className="gap-2 h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            {t('addTask')}
          </Button>
          
          <div className="h-6 w-px bg-gray-200 mx-1" />
          
          <Button variant="ghost" size="sm" className="gap-2 h-9 text-gray-600" onClick={toggleLanguage}>
            <Globe className="w-4 h-4" />
            {language === 'en' ? '中文' : 'English'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-6 flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 px-4 font-medium ${viewMode === '14-days' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                onClick={() => setViewMode('14-days')}
              >
                {t('view14Days')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 px-4 font-medium ${viewMode === '60-days' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                onClick={() => setViewMode('60-days')}
              >
                {t('view60Days')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 px-4 font-medium ${viewMode === '180-days' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                onClick={() => setViewMode('180-days')}
              >
                {t('view180Days')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 px-4 font-medium ${viewMode === '365-days' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                onClick={() => setViewMode('365-days')}
              >
                {t('view365Days')}
              </Button>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900" onClick={handlePrev}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-medium text-gray-500 hover:text-gray-900" onClick={handleToday}>
                {t('today')}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900" onClick={handleNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-gray-600">{t('scheduled')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-gray-600">{t('toDiscuss')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">{t('inDesign')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">{t('done')}</span>
            </div>
          </div>
        </div>

        {/* Timeline View */}
        <div className="flex-1 min-h-0">
          <Timeline />
        </div>
      </main>
      
      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
