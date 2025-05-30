import { useEffect, useState, useCallback } from 'react';
import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { Link } from '@phosphor-icons/react';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '../services/api-error-handler';
import { Link as LinkType } from '../domain/link';
import { linkService } from '../services/http';
import { CreateLinkCard } from '../components/create-link-card';
import { Button } from '../components/common/button';
import { LinkRow } from '../components/link-row';

export function Home() {
    const [links, setLinks] = useState<LinkType[]>([]);
    const [isLoadingLinks, setIsLoadingLinks] = useState(true);
    const [isLoadingCSVDownload, setIsLoadingCSVDownload] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLinks = useCallback(async () => {
        setIsLoadingLinks(true);
        setError(null);
        try {
            const response = await linkService.getPagedLinks();
            setLinks(response.links);
        } catch (err) {
            const errorMessage = getApiErrorMessage(err);
            setError(errorMessage);
            toast.error(`Erro ao carregar links: ${errorMessage}`);
        } finally {
            setIsLoadingLinks(false);
        }
    }, []);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    const handleDownloadCSV = async () => {
        try {
            setIsLoadingCSVDownload(true);
            const downloadUrl = await linkService.exportLinkData();

            const anchor = document.createElement('a');
            anchor.href = downloadUrl.reportUrl;
            anchor.download = '';
            anchor.target = '_blank';
            anchor.click();

            anchor.remove();
            toast.success('Download do CSV iniciado!');
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setIsLoadingCSVDownload(false);
        }
    };

    const handleDeleteShortUrl = async (shortUrl: string) => {
        if (!window.confirm(`Tem certeza que deseja deletar o link brev.ly/${shortUrl}?`)) {
            return;
        }
        try {
            await linkService.deleteLink(shortUrl);
            toast.success('Link deletado com sucesso!');
            fetchLinks();
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        }
    };

    const noData = links.length === 0;

    return (
        <div className='flex py-8 lg:min-h-screen lg:w-screen lg:items-center lg:justify-center bg-[#E4E6EC]'>
            <div className='w-full lg:max-w-6xl'>
                <div className='flex flex-col gap-6 lg:gap-8'>
                    <div className='flex justify-center lg:justify-start'>
                        <img
                            src='/brevly-logo.svg'
                            alt='Brevly logo'
                            className='h-6 w-24'
                        />
                    </div>
                    <div className='grid gap-5 px-3 lg:grid-cols-2'>
                        <CreateLinkCard refetch={fetchLinks} />
                        <div className='h-fit max-h-[750px] min-h-[550px] overflow-y-auto rounded-lg bg-gray-100 p-8'>
                            <div className='mb-5 flex items-center justify-between'>
                                <h1 className='font-sans text-lg text-gray-600'>Meus links</h1>
                                <Button
                                    variant='secondary'
                                    className='flex items-center gap-1.5 p-2 text-sm font-semibold bg-gray-300'
                                    onClick={handleDownloadCSV}
                                    disabled={noData || isLoadingLinks}
                                    loading={isLoadingCSVDownload}
                                >
                                    {!isLoadingCSVDownload && (
                                        <DownloadSimpleIcon
                                            size={16}
                                            className={`${noData || isLoadingLinks ? 'text-gray-600' : 'text-gray-600'}`}
                                        />
                                    )}
                                    <span>Baixar CSV</span>
                                </Button>
                            </div>
                            <div>
                                {isLoadingLinks ? (
                                    <div className='flex justify-center items-center h-48'>
                                        <svg
                                            className="animate-spin h-8 w-8 text-blue-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                    </div>
                                ) : error ? (
                                    <div className='text-center text-red-500 py-10'>
                                        <p>Erro ao carregar os links: {error}</p>
                                        <button onClick={fetchLinks} className="text-blue-600 hover:underline mt-2">Tentar novamente</button>
                                    </div>
                                ) : (
                                    <>
                                        {links.map(
                                            (link) => (
                                                <div className='mt-4' key={link.shortUrl}>
                                                    <div className='mb-4 h-[1px] w-full bg-gray-200' />
                                                    <LinkRow
                                                        accessCount={link.accessCount}
                                                        originalUrl={link.originalUrl}
                                                        shortUrl={link.shortUrl}
                                                        onDelete={() => handleDeleteShortUrl(link.shortUrl)}
                                                        refetch={fetchLinks}
                                                    />
                                                </div>
                                            ),
                                        )}
                                        {noData && (
                                            <div className='mt-4 flex flex-col items-center justify-center'>
                                                <div className='mb-4 h-[1px] w-full bg-gray-200' />
                                                <Link size={32} className='mt-8 mb-3 text-gray-400' />
                                                <p className='mb-6 text-xs text-gray-500'>
                                                    AINDA NÃO EXISTEM LINKS CADASTRADOS
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}