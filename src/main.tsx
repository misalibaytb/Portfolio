import { createRoot } from 'react-dom/client';
import { App } from '@/Components/App';
import { config } from '@/config';
import { StrictMode } from 'react';

const root = createRoot(document.getElementById('app')!);
root.render(<>
    <StrictMode>
        <style>{`
        
        body {
            background: ${config.background.startsWith('/') || config.background.startsWith('http') ? `url('${config.background}')` : config.background};
        background-size: cover;
        background-position: center;
        margin: 0;
        padding: 0;
        height: 100vh;
        width: 100vw;
        }
        html, body {
            font - family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        * {
            box - sizing: border-box;
        margin: 0;
        padding: 0;
        text-decoration: none;
        color: inherit;
        border: none;
        outline: none;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        }
        `}</style>
        <App />
    </StrictMode>
</>);