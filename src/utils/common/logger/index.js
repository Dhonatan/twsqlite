class Logger {
  silent = false;

  log(...messages) {
    !this.silent && console.log(...messages);
  }

  warn(...messages) {
    !this.silent && console.warn(...messages);
  }

  error(...messages) {
    !this.silent && console.error(...messages);
  }

  silence() {
    this.silent = true;
  }
}

export default new Logger();
