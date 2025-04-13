import { useState, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Article, UserResponse } from '../../types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Badge } from '../ui/badge';

interface ArticlesCarouselProps {
  userName: string;
  responses: UserResponse[];
}

export function ArticlesCarousel({ userName, responses }: ArticlesCarouselProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    // Skip if data was already fetched
    if (dataFetchedRef.current) return;
    
    try {
      setLoading(true);
      
      console.log("All responses:", responses);
      
      // Filter responses to only include those from the "Artykuły naukowe" category
      const articleResponses = responses.filter(response => 
        response.category === "Artykuły naukowe"
      );
      
      console.log("Article responses:", articleResponses);
      
      if (articleResponses.length > 0) {
        // Extract articles directly from responses
        const userArticles: Article[] = [];
        
        articleResponses.forEach(response => {
          // Check if the response has articles array
          if (response.articles && response.articles.length > 0) {
            userArticles.push(...response.articles);
          } else {
            // If no articles array, create an article from the response itself
            userArticles.push({
              id: response.id || '',
              title: response.questionTitle,
              points: response.points,
              authors: [],
              journal: '',
              year: undefined,
            });
          }
        });
        
        setArticles(userArticles);
        console.log("Extracted articles:", userArticles);
      } else {
        setArticles([]);
      }
      
      dataFetchedRef.current = true;
    } catch (err) {
      console.error('Error processing user articles:', err);
      setError('Nie udało się przetworzyć artykułów użytkownika');
    } finally {
      setLoading(false);
    }
    
    // Cleanup function to reset the ref when component unmounts
    return () => {
      dataFetchedRef.current = false;
    };
  }, [responses]);

  if (loading) {
    return <div className="text-center py-8">Ładowanie artykułów...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 my-6">
        <h3 className="text-xl font-semibold mb-4 text-black">Publikacje użytkownika</h3>
        <div className="text-center py-8 text-gray-500">Brak dodanych artykułów</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 my-6 w-full">
      <h3 className="text-xl font-semibold mb-4 text-black">Publikacje użytkownika</h3>
      
      <div className="w-full min-h-[400px]">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {articles.map((article, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2 h-[400px]">
                <div className="p-1 h-full">
                  <Card className="h-full flex flex-col border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-2 text-base">{article.title}</CardTitle>
                      <CardDescription>
                        {article.authors && article.authors.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {article.authors.slice(0, 3).map((author, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {author}
                              </Badge>
                            ))}
                            {article.authors.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{article.authors.length - 3}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Brak autorów</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2 flex-grow">
                      <div className="flex flex-col gap-2">
                        {article.points && (
                          <div className="text-sm">
                            <span className="font-medium text-green-700">Punkty: </span>
                            {article.points}
                          </div>
                        )}
                        {article.journal && (
                          <div className="text-sm">
                            <span className="font-medium">Czasopismo: </span>
                            {article.journal}
                          </div>
                        )}
                        {article.year && (
                          <div className="text-sm">
                            <span className="font-medium">Rok: </span>
                            {article.year}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    {article.url && (
                      <CardFooter className="mt-auto pt-2 border-t border-gray-100">
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Zobacz publikację
                        </a>
                      </CardFooter>
                    )}
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 bg-white border border-gray-200 hover:bg-gray-100 shadow-sm" />
          <CarouselNext className="right-2 bg-white border border-gray-200 hover:bg-gray-100 shadow-sm" />
        </Carousel>
      </div>
      
      <div className="text-center text-sm text-gray-500 mt-4">
        {articles.length} publikacji
      </div>
    </div>
  );
}