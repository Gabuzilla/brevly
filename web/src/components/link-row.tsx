import { linkService, API_BASE_URL } from '../services/http';
import { Button } from './common/button';
import { Copy } from '@phosphor-icons/react/dist/icons/Copy';
import { Trash } from '@phosphor-icons/react/dist/icons/Trash';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '../services/api-error-handler';

interface LinkRowProps {
    originalUrl: string;
    shortUrl: string;
    accessCount: number;
    onDelete: (shortUrl: string) => void;
    refetch: () => void;
}

export const LinkRow = ({
    originalUrl,
    shortUrl,
    accessCount,
    onDelete,
    refetch,
}: LinkRowProps) => {
    const fullShortenedUrlFrontend = `${window.location.origin}/${shortUrl}`;

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(fullShortenedUrlFrontend);
            toast.info('Link copiado para a área de transferência!');
        } catch (error) {
            toast.error('Erro ao copiar o link');
        }
    };

    const handleIncrementAndRedirect = async () => {
        try {
            await linkService.incrementLinkAccess(shortUrl);
            window.open(fullShortenedUrlFrontend, '_blank');
            refetch();
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        }
    };

    return (
        <div className='flex items-center justify-between'>
            <div className='flex max-w-1/2 flex-col gap-1'>
                <p
                    onClick={handleIncrementAndRedirect}
                    className='text-md text-blue-600 cursor-pointer truncate hover:underline'
                >
                    {fullShortenedUrlFrontend}
                </p>
                <p className='truncate text-sm text-gray-500'>{originalUrl}</p>
            </div>
            <div className='flex items-center gap-5'>
                <div>
                    <p className='text-sm text-gray-500'>{accessCount} acessos</p>
                </div>
                <div className='flex gap-1'>
                    <Button
                        variant='secondary'
                        className='p-2'
                        onClick={handleCopyToClipboard}
                    >
                        <Copy size={16} />
                    </Button>
                    <Button
                        variant='secondary'
                        className='p-2'
                        onClick={() => onDelete(shortUrl)}
                    >
                        <Trash size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
};