import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert, BookOpen } from 'lucide-react';

interface UserResponse {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  questionId: string;
  questionTitle: string;
  points: number;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  articles?: Article[];
}

interface Article {
  title: string;
  journal?: string;
  year?: number;
  points: number;
}

export default function LibraryEvaluationComponent() {
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { userData, hasRole } = useAuth();
  const [editingResponse, setEditingResponse] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [newArticle, setNewArticle] = useState<Article>({ title: '', points: 0 });

  // Update this line to include 'biblioteka' role
  const hasLibraryAccess = hasRole('library') || hasRole('admin') || hasRole('biblioteka');
  
  console.log('Library component access check:', hasLibraryAccess, 'Biblioteka role:', hasRole('biblioteka'));

  useEffect(() => {
    if (hasLibraryAccess) {
      fetchPendingResponses();
    }
  }, [hasLibraryAccess]);

  const fetchPendingResponses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query all users' responses for the specific question
      const allResponses: UserResponse[] = [];
      
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'Users'));
      
      for (const userDoc of usersSnapshot.docs) {
        const userEmail = userDoc.id;
        const userData = userDoc.data();
        
        // Query responses for this user
        const responsesRef = collection(db, 'Users', userEmail, 'responses');
        const q = query(
          responsesRef,
          where('questionTitle', '==', 'Autorstwo artykułu/monografii (dotyczy pracowników dydaktycznych)')
        );
        
        const responseSnapshot = await getDocs(q);
        
        responseSnapshot.forEach(responseDoc => {
          const responseData = responseDoc.data();
          
          allResponses.push({
            id: responseDoc.id,
            userId: userEmail,
            userName: userData.name || 'Unknown User',
            userEmail: userEmail,
            questionId: responseData.questionId,
            questionTitle: responseData.questionTitle,
            points: responseData.points || 0,
            category: responseData.category,
            status: responseData.status || 'pending',
            articles: responseData.articles || []
          });
        });
      }
      
      setResponses(allResponses);
    } catch (err) {
      console.error('Error fetching responses:', err);
      setError('Nie udało się pobrać odpowiedzi');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditing = (responseId: string, existingArticles: Article[] = []) => {
    setEditingResponse(responseId);
    setArticles(existingArticles);
    setNewArticle({ title: '', points: 0 });
  };

  const handleAddArticle = () => {
    if (newArticle.title.trim() === '') return;
    
    setArticles([...articles, { ...newArticle }]);
    setNewArticle({ title: '', points: 0 });
  };

  const handleRemoveArticle = (index: number) => {
    const updatedArticles = [...articles];
    updatedArticles.splice(index, 1);
    setArticles(updatedArticles);
  };

  const handleSaveEvaluation = async () => {
    if (!editingResponse) return;
    
    try {
      setLoading(true);
      
      // Find the response we're editing
      const response = responses.find(r => r.id === editingResponse);
      if (!response) return;
      
      // Calculate total points
      const totalPoints = articles.reduce((sum, article) => sum + article.points, 0);
      
      // Update the response in Firestore
      const responseRef = doc(db, 'Users', response.userEmail, 'responses', response.id);
      await updateDoc(responseRef, {
        points: totalPoints,
        articles: articles,
        status: 'approved',
        verifiedBy: userData?.email,
        verifiedAt: new Date()
      });
      
      // Update local state
      setResponses(responses.map(r => 
        r.id === editingResponse 
          ? { ...r, points: totalPoints, articles: articles, status: 'approved' } 
          : r
      ));
      
      setSuccessMessage(`Ocena dla ${response.userName} została zapisana`);
      setEditingResponse(null);
    } catch (err) {
      console.error('Error saving evaluation:', err);
      setError('Nie udało się zapisać oceny');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEditing = () => {
    setEditingResponse(null);
    setArticles([]);
  };

  // If user doesn't have library access, show access denied
  if (!hasLibraryAccess) {
    return (
      <div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col mx-2 my-2 overflow-auto">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Brak dostępu</h3>
          <p className="text-gray-600 max-w-md">
            Tylko użytkownicy z rolą bibliotekarza mają dostęp do oceny publikacji.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col mx-2 my-2 overflow-auto">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-800">Ocena publikacji przez bibliotekę</h2>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-100">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-100">
          {successMessage}
        </div>
      )}
      
      {loading && !editingResponse ? (
        <div className="flex items-center justify-center h-40">
          <p>Ładowanie...</p>
        </div>
      ) : (
        <>
          {editingResponse ? (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-black">
              <h3 className="text-lg font-medium mb-4">
                Ocena publikacji dla: {responses.find(r => r.id === editingResponse)?.userName}
              </h3>
              
              <div className="space-y-4 mb-6">
                <h4 className="font-medium">Dodane publikacje:</h4>
                
                {articles.length === 0 ? (
                  <p className="text-gray-500 italic">Brak dodanych publikacji</p>
                ) : (
                  <div className="space-y-3">
                    {articles.map((article, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-white rounded border border-gray-200">
                        <div className="flex-1">
                          <p className="font-medium">{article.title}</p>
                          {article.journal && <p className="text-sm text-gray-600">Czasopismo: {article.journal}</p>}
                          {article.year && <p className="text-sm text-gray-600">Rok: {article.year}</p>}
                          <p className="text-sm font-medium text-green-700 mt-1">Punkty: {article.points}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveArticle(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Usuń
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="bg-white p-4 rounded border border-gray-200 mb-4">
                <h4 className="font-medium mb-3">Dodaj nową publikację</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tytuł publikacji</label>
                    <Input
                      value={newArticle.title}
                      onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                      placeholder="Wprowadź tytuł publikacji"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Czasopismo (opcjonalnie)</label>
                    <Input
                      value={newArticle.journal || ''}
                      onChange={(e) => setNewArticle({...newArticle, journal: e.target.value})}
                      placeholder="Wprowadź nazwę czasopisma"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Rok (opcjonalnie)</label>
                    <Input
                      type="number"
                      value={newArticle.year || ''}
                      onChange={(e) => setNewArticle({...newArticle, year: parseInt(e.target.value) || undefined})}
                      placeholder="Wprowadź rok publikacji"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Punkty</label>
                    <Input
                      type="number"
                      value={newArticle.points}
                      onChange={(e) => setNewArticle({...newArticle, points: parseFloat(e.target.value) || 0})}
                      placeholder="Wprowadź liczbę punktów"
                      min={0}
                      step={0.5}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleAddArticle}
                    disabled={!newArticle.title.trim()}
                    className="w-full"
                  >
                    Dodaj publikację
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleCancelEditing}
                >
                  Anuluj
                </Button>
                <Button 
                  onClick={handleSaveEvaluation}
                  disabled={articles.length === 0}
                >
                  Zapisz ocenę
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-lg text-black font-medium mb-4">Lista zgłoszonych publikacji do oceny</h3>
              
              {responses.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <p className="text-gray-500">Brak zgłoszonych publikacji do oceny</p>
                </div>
              ) : (
                <div className="space-y-4 text-black">
                  {responses.map(response => (
                    <div 
                      key={response.id} 
                      className={`p-4 rounded-lg shadow border-2 ${
                        response.status === 'approved' ? 'border-green-500 bg-green-50' :
                        response.status === 'rejected' ? 'border-red-500 bg-red-50' :
                        'border-amber-500 bg-amber-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{response.userName}</h4>
                          <p className="text-sm text-gray-600">{response.userEmail}</p>
                          <p className="text-sm mt-1">
                            <span className="font-medium">Kategoria:</span> {response.category}
                          </p>
                        </div>
                        <div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            response.status === 'approved' ? 'bg-green-100 text-green-800' :
                            response.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {response.status === 'approved' ? 'Ocenione' :
                             response.status === 'rejected' ? 'Odrzucone' : 'Oczekujące'}
                          </span>
                        </div>
                      </div>
                      
                      {response.articles && response.articles.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium mb-2">Ocenione publikacje:</h5>
                          <div className="space-y-2">
                            {response.articles.map((article, index) => (
                              <div key={index} className="text-sm bg-white p-2 rounded border border-gray-200">
                                <p className="font-medium">{article.title}</p>
                                {article.journal && <p className="text-gray-600">Czasopismo: {article.journal}</p>}
                                {article.year && <p className="text-gray-600">Rok: {article.year}</p>}
                                <p className="text-green-700 mt-1">Punkty: {article.points}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-end">
                        <Button
                          onClick={() => handleStartEditing(response.id, response.articles)}
                          variant={response.status === 'approved' ? 'outline' : 'default'}
                        >
                          {response.status === 'approved' ? 'Edytuj ocenę' : 'Oceń publikacje'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      <div className="mt-4">
        <Button 
          onClick={fetchPendingResponses}
          variant="outline"
          className="w-full"
        >
          Odśwież listę
        </Button>
      </div>
    </div>
  );
}