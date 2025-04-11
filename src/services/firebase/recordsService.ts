import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import records from '../../lib/records.json';
import { Article } from '../../types';

// Remove the Record interface since we'll use Article from types

export async function addRecordToFirestore(record: Article): Promise<string> {
  try {
    // Check if record already exists
    const articlesRef = collection(db, 'Articles');
    const q = query(articlesRef, where('id', '==', record.id));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log(`Article with ID ${record.id} already exists`);
      return querySnapshot.docs[0].id;
    }
    
    // Add new record to Articles collection
    const docRef = await addDoc(articlesRef, {
      ...record,
      createdAt: new Date()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding article:', error);
    throw error;
  }
}

export async function importAllRecords(): Promise<{ added: number, skipped: number }> {
  let added = 0;
  let skipped = 0;
  
  try {
    for (const record of records) {
      try {
        // Check if record already exists in Articles collection
        const articlesRef = collection(db, 'Articles');
        const q = query(articlesRef, where('id', '==', record.id));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          console.log(`Article with ID ${record.id} already exists`);
          skipped++;
          continue;
        }
        
        // Add new record to Articles collection
        await addDoc(articlesRef, {
          ...record,
          createdAt: new Date()
        });
        
        added++;
      } catch (err) {
        console.error(`Error adding article ${record.id}:`, err);
        skipped++;
      }
    }
    
    return { added, skipped };
  } catch (error) {
    console.error('Error importing articles:', error);
    throw error;
  }
}