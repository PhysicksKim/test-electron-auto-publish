import { createRoot } from 'react-dom/client';
import AppTestWindow from './App-TestWindow';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<AppTestWindow />);
