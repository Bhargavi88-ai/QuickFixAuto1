import React, { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export const AnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const path = 'announcements';
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setAnnouncement(data);
        setIsVisible(true);
      } else {
        setAnnouncement(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, []);

  if (!announcement || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="bg-orange text-white py-3 px-6 flex items-center justify-between z-[60] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-black/5 pointer-events-none" />
        <div className="container mx-auto flex items-center justify-center gap-4">
          <Megaphone size={18} className="animate-bounce" />
          <p className="text-xs font-black uppercase tracking-[1.5px] leading-tight text-center">
            {announcement.message}
          </p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors ml-4"
        >
          <X size={18} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
