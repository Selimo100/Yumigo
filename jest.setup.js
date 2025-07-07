// Jest Setup Datei - Vereinfacht

// Global test utils
global.fetch = jest.fn();

// Console Warnings unterdrücken
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: componentWillReceiveProps has been renamed'))
  ) {
    return;
  }
  originalWarn(...args);
};
