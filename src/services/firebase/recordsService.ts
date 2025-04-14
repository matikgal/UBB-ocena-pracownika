import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Article } from '../../types';
import { addArticleWithIndexing } from './articlesService';

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
    
    // Use the new function that adds proper author indexing
    return await addArticleWithIndexing(record);
  } catch (error) {
    console.error('Error adding article:', error);
    throw error;
  }
}

/**
 * Imports all records from the records.json file
 * @returns Object with count of added and skipped records
 */
export async function importAllRecords(): Promise<{ added: number, skipped: number }> {
  try {
    // Fetch the records.json file
    const response = await fetch('/records.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch records.json: ${response.statusText}`);
    }
    
    const records: Article[] = await response.json();
    console.log(`Loaded ${records.length} records from records.json`);
    
    let added = 0;
    let skipped = 0;
    
    // Process each record
    for (const record of records) {
      try {
        // Skip records without required fields
        if (!record.title || !record.id) {
          console.warn('Skipping record with missing title or id:', record);
          skipped++;
          continue;
        }
        
        // Ensure points is a number
        if (typeof record.points === 'string') {
          record.points = parseFloat(String(record.points).replace(/[^\d.]/g, '')) || 0;
        } else if (record.points === undefined || record.points === null) {
          // If points is missing, try to extract from pk field
          if (record.pk) {
            const numericValue = record.pk.replace(/[^\d.]/g, '');
            record.points = parseFloat(numericValue) || 0;
          } else {
            record.points = 0;
          }
        }
        
        // Check if record already exists
        const articlesRef = collection(db, 'Articles');
        const q = query(articlesRef, where('id', '==', record.id));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          console.log(`Article with ID ${record.id} already exists`);
          skipped++;
          continue;
        }
        
        // Add the record with proper indexing
        await addArticleWithIndexing(record);
        added++;
        
        // Log progress every 10 records
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