/**
 * Serwis do importowania i zarządzania rekordami publikacji naukowych.
 * Umożliwia dodawanie pojedynczych rekordów oraz masowy import z pliku JSON.
 */
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Article } from '../../types';
import { addArticleWithIndexing } from './articles/articlesService';

export async function addRecordToFirestore(record: Article): Promise<string> {
  try {
 
    const articlesRef = collection(db, 'Articles');
    const q = query(articlesRef, where('id', '==', record.id));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log(`Article with ID ${record.id} already exists`);
      return querySnapshot.docs[0].id;
    }
    

    return await addArticleWithIndexing(record);
  } catch (error) {
    console.error('Error adding article:', error);
    throw error;
  }
}

export async function importAllRecords(): Promise<{ added: number, skipped: number }> {
  try {
   
    const response = await fetch('/records.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch records.json: ${response.statusText}`);
    }
    
    const records: Article[] = await response.json();
    console.log(`Loaded ${records.length} records from records.json`);
    
    let added = 0;
    let skipped = 0;
    
   
    for (const record of records) {
      try {
     
        if (!record.title || !record.id) {
          console.warn('Skipping record with missing title or id:', record);
          skipped++;
          continue;
        }
        
     
        if (typeof record.points === 'string') {
          record.points = parseFloat(String(record.points).replace(/[^\d.]/g, '')) || 0;
        } else if (record.points === undefined || record.points === null) {
        
          if (record.pk) {
            const numericValue = record.pk.replace(/[^\d.]/g, '');
            record.points = parseFloat(numericValue) || 0;
          } else {
            record.points = 0;
          }
        }
        
     
        const articlesRef = collection(db, 'Articles');
        const q = query(articlesRef, where('id', '==', record.id));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          console.log(`Article with ID ${record.id} already exists`);
          skipped++;
          continue;
        }
        
     
        await addArticleWithIndexing(record);
        added++;
        
  
        if ((added + skipped) % 10 === 0) {
          console.log(`Progress: ${added} added, ${skipped} skipped, total: ${added + skipped}/${records.length}`);
        }
      } catch (err) {
        console.error(`Error processing record ${record.id || 'unknown'}:`, err);
        skipped++;
      }
    }
    
    console.log(`Import completed: ${added} added, ${skipped} skipped`);
    return { added, skipped };
  } catch (error) {
    console.error('Error importing records:', error);
    throw error;
  }
}