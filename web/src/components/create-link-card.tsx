import { useForm } from 'react-hook-form';
import { Button } from './common/button';
import { Input } from './common/input';
import { Label } from './common/label';
import { linkService } from '../services/http';
import { Warning } from '@phosphor-icons/react/dist/icons/Warning';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '../services/api-error-handler';

interface CreateLinkForm {
    originalUrl: string;
    shortUrl: string;
}

interface CreateLinkCardProps {
    refetch: () => void;
}

export const CreateLinkCard = ({ refetch }: CreateLinkCardProps) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
        clearErrors,
    } = useForm<CreateLinkForm>();

    const handleSubmitForm = async (data: CreateLinkForm) => {
        clearErrors();

        let hasError = false;
        const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
        if (!data.originalUrl || !data.originalUrl.trim()) {
            setError('originalUrl', { type: 'manual', message: 'A URL original é obrigatória.' });
            hasError = true;
        } else if (!urlRegex.test(data.originalUrl)) {
            setError('originalUrl', { type: 'manual', message: 'A URL original deve ser uma URL válida.' });
            hasError = true;
        }

        const shortUrlRegex = /^[a-zA-Z0-9_-]{4,15}$/;
        if (!data.shortUrl || !data.shortUrl.trim()) {
            setError('shortUrl', { type: 'manual', message: 'A URL encurtada é obrigatória.' });
            hasError = true;
        } else if (!shortUrlRegex.test(data.shortUrl)) {
            setError('shortUrl', {
                type: 'manual',
                message: 'A URL encurtada deve ter entre 4 e 15 caracteres, contendo apenas letras, números, hífens ou underlines.',
            });
            hasError = true;
        }

        if (hasError) {
            return;
        }

        try {
            await linkService.createLink(data.originalUrl, data.shortUrl);
            reset();
            refetch();
            toast.success('Link criado com sucesso!');
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        }
    };

    return (
        <form
            onSubmit={handleSubmit(handleSubmitForm)}
            className='flex h-fit flex-col rounded-lg bg-gray-100 p-8'
        >
            <h1 className='mb-6 font-sans text-lg text-gray-600'>Novo link</h1>
            <div className='flex flex-col gap-4'>
                <div className='flex w-full flex-col-reverse gap-1.5'>
                    <div className='flex items-center gap-2'>
                        {errors.originalUrl?.message && (
                            <>
                                <Warning size={16} className='text-red-500' />
                                <p className='text-sm text-gray-500'>
                                    {errors.originalUrl?.message}
                                </p>
                            </>
                        )}
                    </div>
                    <Input
                        type='url'
                        inputId='originalUrl'
                        placeholder='www.exemplo.com.br'
                        inputStatus={errors.originalUrl?.message ? 'error' : 'normal'}
                        {...register('originalUrl')}
                    />
                    <Label
                        inputId='originalUrl'
                        inputStatus={errors.originalUrl?.message ? 'error' : 'normal'}
                    >
                        LINK ORIGINAL
                    </Label>
                </div>
                <div className='flex w-full flex-col-reverse gap-1.5'>
                    <div className='flex items-center gap-2'>
                        {errors.shortUrl?.message && (
                            <>
                                <Warning size={16} className='text-red-500' />
                                <p className='text-sm text-gray-500'>
                                    {errors.shortUrl?.message}
                                </p>
                            </>
                        )}
                    </div>
                    <Input
                        type='text'
                        inputId='shortUrl'
                        placeholder='brev.ly/'
                        inputStatus={errors.shortUrl?.message ? 'error' : 'normal'}
                        {...register('shortUrl')}
                    />
                    <Label
                        inputId='shortUrl'
                        inputStatus={errors.shortUrl?.message ? 'error' : 'normal'}
                    >
                        LINK ENCURTADO
                    </Label>
                </div>
            </div>
            <Button
                type='submit'
                className='text-md mt-6 py-4'
                loading={isSubmitting}
            >
                Salvar link
            </Button>
        </form>
    );
};