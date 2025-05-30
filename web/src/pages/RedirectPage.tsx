import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { linkService } from '../services/http';
import { getApiErrorMessage } from '../services/api-error-handler';
import { toast } from 'react-toastify';
import { Link as LinkIcon } from '@phosphor-icons/react/dist/icons/Link';

export function RedirectPage() {
    const { shortUrl } = useParams<{ shortUrl: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleRedirectLogic = useCallback(async () => {
        if (!shortUrl) {
            setError('URL encurtada inválida ou faltando.');
            setLoading(false);
            return;
        }

        try {
            const linkData = await linkService.getLink(shortUrl);
            const originalUrl = linkData.originalUrl;

            linkService.incrementLinkAccess(shortUrl).catch(err => {
                console.error('RedirectPage: Erro ao incrementar acesso (continuando com o redirecionamento):', err);
                toast.warn('Não foi possível registrar o acesso, mas redirecionando...');
            });

            console.log(`RedirectPage: Redirecionando para: ${originalUrl}`);
            setTimeout(() => {
                window.location.replace(originalUrl);
            }, 1500);

        } catch (err) {
            setLoading(false);
            const errorMessage = getApiErrorMessage(err);
            setError(errorMessage);
            toast.error(`Falha ao redirecionar: ${errorMessage}`);
            console.error('RedirectPage: Erro ao obter URL original ou no redirecionamento:', err);
        }
    }, [shortUrl]); 

    useEffect(() => {
        setLoading(true);
        handleRedirectLogic();
    }, [handleRedirectLogic]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-10">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <LinkIcon size={48} className="text-blue-500 mx-auto animate-pulse" />
                    <h1 className="text-xl font-semibold mt-4 text-gray-700">Redirecionando...</h1>
                    <p className="text-gray-600 mt-2">
                        O link será aberto automaticamente em alguns instantes.
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-10">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <img src="/brevly-logo.svg" alt="brev.ly logo" className="h-10 mx-auto mb-4" />
                    <h1 className="text-xl font-semibold text-red-600">Erro no Redirecionamento</h1>
                    <p className="text-gray-700 mt-2">{error}</p>
                    <p className="text-gray-600 mt-4">
                        Não foi redirecionado?{' '}
                        <button
                            onClick={() => navigate('/')}
                            className="text-blue-600 hover:underline focus:outline-none"
                        >
                            Acesse a página inicial.
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    return null;
}