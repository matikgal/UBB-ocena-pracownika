import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Article } from '../../types'; // Changed from Record import
import { getArticlesByAuthor } from '../../services/firebase/articlesService';
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
}

export function ArticlesCarousel({ userName }: ArticlesCarouselProps) {
  const [articles, setArticles] = useState<Article[]>([]); // Changed from Record[] to Article[]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        // Extract first and last name for better matching
        const nameParts = userName.split(' ');
        if (nameParts.length > 0) {
          const authorName = nameParts[0]; // Use first name for search
          const articles = await getArticlesByAuthor(authorName);
          setArticles(articles);
        } else {
          setArticles([]);
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Nie udało się pobrać artykułów');
      } finally {
        setLoading(false);
      }
    };

    if (userName) {
      fetchArticles();
    }
  }, [userName]);

  if (loading) {
    return <div className="text-center py-8">Ładowanie artykułów...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (articles.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nie znaleziono artykułów dla tego autora</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 my-6">
      <h3 className="text-xl font-semibold mb-4 text-black">Publikacje autora</h3>
      
      <Carousel className="w-full">
        <CarouselContent>
          {articles.map((article, index) => (
            <CarouselItem key={article.id || index} className="md:basis-1/2 lg:basis-1/2">
              <div className="p-1">
                <Card>
                  <CardHeader>
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
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {article.pk && (
                        <div className="text-sm">
                          <span className="font-medium text-green-700">Punkty: </span>
                          {article.pk}
                        </div>
                      )}
                      {article.oa_info && (
                        <div className="text-sm">
                          <span className="font-medium">Open Access do: </span>
                          {article.oa_info}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {article.ww ? (
                      <a 
                        href={article.ww} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Zobacz publikację
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">Brak linku do publikacji</span>
                    )}
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      
      <div className="text-center text-sm text-gray-500 mt-4">
        {articles.length} publikacji
      </div>
    </div>
  );
}