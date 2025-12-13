const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function formatTimestamp() {
  return new Date().toISOString();
}

export const logger = {
  info: (message, ...args) => {
    console.log(
      `${colors.cyan}[INFO]${colors.reset} ${colors.bright}${formatTimestamp()}${colors.reset} ${message}`,
      ...args
    );
  },
  
  success: (message, ...args) => {
    console.log(
      `${colors.green}[SUCCESS]${colors.reset} ${colors.bright}${formatTimestamp()}${colors.reset} ${message}`,
      ...args
    );
  },
  
  warn: (message, ...args) => {
    console.warn(
      `${colors.yellow}[WARN]${colors.reset} ${colors.bright}${formatTimestamp()}${colors.reset} ${message}`,
      ...args
    );
  },
  
  error: (message, error = null, ...args) => {
    console.error(
      `${colors.red}[ERROR]${colors.reset} ${colors.bright}${formatTimestamp()}${colors.reset} ${message}`,
      ...args
    );
    if (error) {
      console.error(error);
    }
  },
  
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${colors.magenta}[DEBUG]${colors.reset} ${colors.bright}${formatTimestamp()}${colors.reset} ${message}`,
        ...args
      );
    }
  },
};

