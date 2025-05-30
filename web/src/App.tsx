import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { RedirectPage } from './pages/RedirectPage';

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/:shortUrl" element={<RedirectPage />} />
                <Route
                    path="*"
                    element={
                        <div className="h-dvh flex flex-col items-center justify-center p-10 bg-gray-100">
                            <h1 className="text-3xl font-bold text-gray-800">404</h1>
                            <p className="text-lg text-gray-600 mt-2">Página Não Encontrada</p>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="mt-4 text-blue-600 hover:underline"
                            >
                                Voltar para a Home
                            </button>
                        </div>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}