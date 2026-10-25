import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup, configure } from '@testing-library/react';

// Lazy-loaded pages can take a moment on slow machines
configure({ asyncUtilTimeout: 5000 });

afterEach(() => cleanup());

// jsdom does not implement these browser APIs
window.scrollTo = () => {};
window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {});
