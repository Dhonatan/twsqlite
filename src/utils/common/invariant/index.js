import diagnosticError from '../diagnosticError';

export default function invariant(condition, errorMessage) {
  if (!condition) {
    const error = diagnosticError(errorMessage || 'Broken invariant');
    error.framesToPop += 1;

    throw error;
  }
}
