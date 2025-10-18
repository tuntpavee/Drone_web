"use client";
import React, { useState, useEffect, useRef } from 'react';

// --- Main Page Component ---
export default function RemoteCommandPage() {
  const [history, setHistory] = useState([
    { type: 'info', text: 'Remote Terminal Initialized. Type "help" for a list of commands.' }
  ]);
  const [input, setInput] = useState('');
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  // Automatically scroll to the bottom of the terminal history
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Focus the input field when the component mounts or the page is clicked
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handlePageClick = () => {
    inputRef.current?.focus();
  };

  // --- Command Processing Logic ---
  const processCommand = (command) => {
    const newHistory = [...history, { type: 'command', text: command }];

    switch (command.toLowerCase().trim()) {
      case 'help':
        newHistory.push({ type: 'info', text: 'Available commands:' });
        newHistory.push({ type: 'response', text: '  help   - Show this list of commands' });
        newHistory.push({ type: 'response', text: '  clear  - Clear the terminal screen' });
        newHistory.push({ type: 'response', text: '  date   - Display the current date and time' });
        newHistory.push({ type: 'response', text: '  ping   - Simulate pinging a remote host' });
        break;
      
      case 'clear':
        setHistory([]); // Clear history directly
        return; // Exit early

      case 'date':
        newHistory.push({ type: 'response', text: new Date().toLocaleString() });
        break;

      case 'ping':
        newHistory.push({ type: 'response', text: 'Pinging drone.local (192.168.1.1) with 32 bytes of data:' });
        setTimeout(() => setHistory(prev => [...prev, { type: 'response', text: 'Reply from 192.168.1.1: bytes=32 time=12ms TTL=64' }]), 500);
        setTimeout(() => setHistory(prev => [...prev, { type: 'response', text: 'Reply from 192.168.1.1: bytes=32 time=15ms TTL=64' }]), 1000);
        setTimeout(() => setHistory(prev => [...prev, { type: 'response', text: 'Reply from 192.168.1.1: bytes=32 time=11ms TTL=64' }]), 1500);
        break;

      default:
        newHistory.push({ type: 'error', text: `command not found: ${command}` });
        break;
    }
    setHistory(newHistory);
  };

  // Handle 'Enter' key press in the input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processCommand(input);
      setInput('');
    }
  };

  return (
    <div style={styles.page} onClick={handlePageClick}>
      <div style={styles.terminal}>
        <div style={styles.history}>
          {history.map((line, index) => (
            <div key={index} style={styles.line}>
              {line.type === 'command' && <span style={styles.prompt}>&gt; </span>}
              <span style={styles[line.type]}>{line.text}</span>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
        <div style={styles.inputLine}>
          <span style={styles.prompt}>&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.input}
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}

// --- Inline Styles (Self-contained) ---
const styles = {
  page: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'monospace, "Courier New", Courier',
    background: '#1a1a1a',
    color: '#e0e0e0',
  },
  terminal: {
    width: '95%',
    height: '95%',
    background: '#0d0d0d',
    borderRadius: '8px',
    border: '1px solid #333',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  history: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
    fontSize: '16px',
  },
  line: {
    marginBottom: '4px',
    wordBreak: 'break-all',
  },
  prompt: {
    color: '#50fa7b', // Green prompt
    marginRight: '8px',
  },
  inputLine: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px 12px 12px',
  },
  input: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: '#e0e0e0',
    fontSize: '16px',
    fontFamily: 'monospace, "Courier New", Courier',
    outline: 'none',
  },
  // Text styles for different line types
  command: {
    color: '#f1fa8c', // Yellow for commands
  },
  response: {
    color: '#e0e0e0', // White for responses
  },
  info: {
    color: '#8be9fd', // Cyan for info
  },
  error: {
    color: '#ff5555', // Red for errors
  },
};